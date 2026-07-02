package com.meladen.service;

import com.meladen.config.MeladenProperties;
import com.meladen.dto.DeliveryQuote;
import com.meladen.dto.OrderResponse;
import com.meladen.dto.PaymentVerifyRequest;
import com.meladen.dto.PlaceOrderRequest;
import com.meladen.dto.RazorpayCheckoutResponse;
import com.meladen.dto.StockSummaryResponse;
import com.meladen.dto.StockUpdateRequest;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.CustomerOrderItem;
import com.meladen.entity.InventoryStock;
import com.meladen.entity.Product;
import com.meladen.repository.CustomerOrderRepository;
import com.meladen.repository.InventoryStockRepository;
import com.meladen.repository.ProductRepository;
import com.meladen.util.ProductCategoryRules;
import com.meladen.util.InvoiceHsnCodes;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OrderService {

  private static final Long STOCK_ROW_ID = 1L;
  private static final BigDecimal LOW_ALCOHOL_THRESHOLD = new BigDecimal("200");

  private final MeladenProperties properties;
  private final ProductRepository productRepository;
  private final InventoryStockRepository stockRepository;
  private final CustomerOrderRepository orderRepository;
  private final PromoCodeService promoCodeService;
  private final WalletService walletService;
  private final OrderMailService orderMailService;
  private final OrderPostConfirmService orderPostConfirmService;
  private final RazorpayService razorpayService;
  private final ShiprocketService shiprocketService;
  private final OrderNumberService orderNumberService;

  @Transactional
  public OrderResponse placeOrder(PlaceOrderRequest request, Long customerIdOrNull) {
    if (request.items() == null || request.items().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order items are required");
    }

    ComputedOrder computed = computeOrder(request, customerIdOrNull);
    List<ResolvedOrderItem> resolved = computed.resolved();
    BigDecimal totalAlcoholRequired = computed.totalAlcoholRequired();

    CustomerOrder order = buildOrderEntity(request, customerIdOrNull, computed);
    List<CustomerOrderItem> items = new ArrayList<>();
    for (ResolvedOrderItem row : resolved) {
      CustomerOrderItem oi = new CustomerOrderItem();
      oi.setOrder(order);
      oi.setProduct(row.product());
      oi.setProductName(row.product().getMeladenFragrance());
      oi.setSizeLabel(row.recipe().label());
      oi.setQuantity(row.item().quantity());
      oi.setUnitPrice(row.item().unitPrice().setScale(2, RoundingMode.HALF_UP));
      oi.setLineTotal(row.lineTotal());
      oi.setOilUsedGm(row.oilUsedGm().setScale(2, RoundingMode.HALF_UP));
      oi.setAlcoholUsedGm(row.alcoholUsedGm().setScale(2, RoundingMode.HALF_UP));
      oi.setHsnCode(InvoiceHsnCodes.forProduct(row.product()));
      items.add(oi);
    }
    order.setItems(items);
    order.setAlcoholUsedGm(totalAlcoholRequired.setScale(2, RoundingMode.HALF_UP));
    order.setStatus("PAYMENT_PENDING");

    CustomerOrder savedOrder = orderRepository.save(order);
    orderMailService.sendOrderPendingEmail(savedOrder);
    return toOrderResponse(savedOrder);
  }

  @Transactional(readOnly = true)
  public OrderResponse getOrderForCustomer(String orderId, Long customerId) {
    CustomerOrder order = loadOwnedOrder(orderId, customerId);
    return toOrderResponse(order);
  }

  @Transactional
  public RazorpayCheckoutResponse createRazorpayCheckout(String orderId, Long customerId) {
    CustomerOrder order = loadOwnedOrder(orderId, customerId);
    if (!"PAYMENT_PENDING".equals(order.getStatus())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not awaiting payment");
    }
    if (order.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No payment required for this order");
    }
    String razorpayOrderId = razorpayService.createOrder(order.getOrderNumber(), order.getTotal());
    order.setRazorpayOrderId(razorpayOrderId);
    orderRepository.save(order);
    return new RazorpayCheckoutResponse(
        razorpayService.getKeyId(),
        razorpayOrderId,
        order.getTotal(),
        "INR",
        order.getId(),
        order.getOrderNumber(),
        order.getCustomerName(),
        order.getCustomerEmail(),
        order.getCustomerPhone());
  }

  @Transactional
  public OrderResponse verifyPayment(String orderId, Long customerId, PaymentVerifyRequest body) {
    CustomerOrder order = loadOwnedOrder(orderId, customerId);
    if ("PAID".equals(order.getStatus()) || "PLACED".equals(order.getStatus())) {
      return toOrderResponse(order);
    }
    if (!"PAYMENT_PENDING".equals(order.getStatus())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order cannot be paid");
    }
    if (order.getRazorpayOrderId() == null
        || !order.getRazorpayOrderId().equals(body.razorpayOrderId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment order mismatch");
    }
    if (!razorpayService.verifySignature(
        body.razorpayOrderId(), body.razorpayPaymentId(), body.razorpaySignature())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature");
    }
    order.setRazorpayPaymentId(body.razorpayPaymentId());
    order.setPaymentMethod("RAZORPAY");
    return finalizeConfirmedOrder(order, customerId, "PAID");
  }

  @Transactional
  public OrderResponse confirmCashOnDelivery(String orderId, Long customerId) {
    CustomerOrder order = loadOwnedOrder(orderId, customerId);
    if ("PAID".equals(order.getStatus()) || "COD".equals(order.getStatus())) {
      return toOrderResponse(order);
    }
    if (!"PAYMENT_PENDING".equals(order.getStatus())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order cannot be confirmed");
    }
    order.setPaymentMethod("COD");
    return finalizeConfirmedOrder(order, customerId, "COD");
  }

  @Transactional
  public OrderResponse completeOrderWithoutRazorpay(String orderId, Long customerId) {
    CustomerOrder order = loadOwnedOrder(orderId, customerId);
    if ("PAID".equals(order.getStatus()) || "PLACED".equals(order.getStatus())) {
      return toOrderResponse(order);
    }
    if (!"PAYMENT_PENDING".equals(order.getStatus())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order cannot be completed");
    }
    if (order.getTotal().compareTo(BigDecimal.ZERO) > 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment is required");
    }
    order.setPaymentMethod("WALLET");
    return finalizeConfirmedOrder(order, customerId, "PAID");
  }

  private OrderResponse finalizeConfirmedOrder(CustomerOrder order, Long customerId, String status) {
    CustomerOrder saved = persistConfirmedOrder(order, customerId, status);
    schedulePostConfirmDispatch(saved.getId());
    return toOrderResponse(saved);
  }

  private CustomerOrder persistConfirmedOrder(CustomerOrder order, Long customerId, String status) {
    PlaceOrderRequest snapshot = orderToSnapshotRequest(order);
    ComputedOrder computed = computeOrder(snapshot, customerId);
    applyInventory(computed);

    if (computed.walletUse().compareTo(BigDecimal.ZERO) > 0 && customerId != null) {
      walletService.debitForOrder(customerId, order.getId(), computed.walletUse());
    }

    order.setShipping(computed.shipping());
    order.setCodCharges(computed.codCharges());
    order.setWalletDiscount(computed.walletUse());
    order.setTotal(computed.finalTotal());
    order.setStatus(status);
    return orderRepository.save(order);
  }

  private void schedulePostConfirmDispatch(String orderId) {
    if (!TransactionSynchronizationManager.isSynchronizationActive()) {
      orderPostConfirmService.dispatch(orderId);
      return;
    }
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            orderPostConfirmService.dispatch(orderId);
          }
        });
  }

  private void applyInventory(ComputedOrder computed) {
    InventoryStock stock = getOrCreateStock();
    for (ResolvedOrderItem row : computed.resolved()) {
      Product p = row.product();
      if (p.getProductOil() != null && row.oilUsedGm().signum() > 0) {
        p.setProductOil(p.getProductOil().subtract(row.oilUsedGm()).setScale(2, RoundingMode.HALF_UP));
      }
    }
    stock.setAlcoholStockGm(
        stock.getAlcoholStockGm().subtract(computed.totalAlcoholRequired()).setScale(2, RoundingMode.HALF_UP));
    stock.setUpdatedAt(Instant.now());
    productRepository.saveAll(computed.resolved().stream().map(ResolvedOrderItem::product).toList());
    stockRepository.save(stock);
  }

  private ComputedOrder computeOrder(PlaceOrderRequest request, Long customerIdOrNull) {
    if (request.items() == null || request.items().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order items are required");
    }

    InventoryStock stock = getOrCreateStock();
    BigDecimal totalAlcoholRequired = BigDecimal.ZERO;
    List<ResolvedOrderItem> resolved = new ArrayList<>();
    BigDecimal subtotal = BigDecimal.ZERO;

    for (PlaceOrderRequest.OrderItemRequest item : request.items()) {
      Product product =
          productRepository
              .findDetailById(item.productId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product: " + item.productId()));
      SizeRecipe recipe = sizeRecipe(item.size());
      validateSizeForProduct(product, recipe);
      int qty = item.quantity();
      BigDecimal qtyDecimal = BigDecimal.valueOf(qty);

      BigDecimal oilRequired = recipe.oilPerUnitGm().multiply(qtyDecimal);
      BigDecimal alcoholRequired = recipe.alcoholPerUnitGm().multiply(qtyDecimal);
      BigDecimal lineTotal = item.unitPrice().multiply(qtyDecimal).setScale(2, RoundingMode.HALF_UP);

      if (oilRequired.signum() > 0) {
        if (product.getProductOil() == null) {
          throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Product stock not set for " + product.getMeladenFragrance());
        }
        if (product.getProductOil().compareTo(oilRequired) < 0) {
          String unit = ProductCategoryRules.isFinishedProduct(product) ? "units" : "gm";
          throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST,
              "Insufficient product stock for "
                  + product.getMeladenFragrance()
                  + " (need "
                  + oilRequired.stripTrailingZeros().toPlainString()
                  + " "
                  + unit
                  + ")");
        }
      }

      subtotal = subtotal.add(lineTotal);
      totalAlcoholRequired = totalAlcoholRequired.add(alcoholRequired);
      resolved.add(new ResolvedOrderItem(product, item, recipe, lineTotal, oilRequired, alcoholRequired));
    }

    if (stock.getAlcoholStockGm().compareTo(totalAlcoholRequired) < 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient alcohol stock");
    }

    BigDecimal discount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    String appliedPromo = null;
    if (request.promoCode() != null && !request.promoCode().isBlank()) {
      var validation = promoCodeService.validate(request.promoCode(), subtotal.setScale(2, RoundingMode.HALF_UP));
      if (!Boolean.TRUE.equals(validation.get("valid"))) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, String.valueOf(validation.get("message")));
      }
      discount = ((BigDecimal) validation.get("discountAmount")).setScale(2, RoundingMode.HALF_UP);
      appliedPromo = String.valueOf(validation.get("code"));
    }

    BigDecimal subtotalAfterDiscount =
        subtotal.subtract(discount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

    int itemUnits =
        request.items().stream().mapToInt(PlaceOrderRequest.OrderItemRequest::quantity).sum();
    boolean codPayment = isCodPayment(request.paymentMethod());
    DeliveryQuote deliveryQuote =
        shiprocketService.quoteDelivery(
            request.postcode(), subtotalAfterDiscount, itemUnits, codPayment);

    BigDecimal shipping = deliveryQuote.shippingFee();
    MeladenProperties.OrderPricing pricing = properties.getOrderPricing();
    if (!deliveryQuote.shiprocketAvailable()
        && subtotalAfterDiscount.compareTo(pricing.getFreeShippingThreshold()) >= 0) {
      shipping = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    BigDecimal codCharges =
        codPayment ? deliveryQuote.codCharges() : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    BigDecimal preWalletTotal =
        subtotalAfterDiscount.add(shipping).add(codCharges).setScale(2, RoundingMode.HALF_UP);
    BigDecimal walletUse = resolveWalletDiscount(request, customerIdOrNull, preWalletTotal);
    BigDecimal finalTotal =
        preWalletTotal.subtract(walletUse).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

    return new ComputedOrder(
        resolved,
        subtotal.setScale(2, RoundingMode.HALF_UP),
        discount,
        appliedPromo,
        shipping.setScale(2, RoundingMode.HALF_UP),
        codCharges,
        walletUse,
        finalTotal,
        totalAlcoholRequired.setScale(2, RoundingMode.HALF_UP));
  }

  @Transactional(readOnly = true)
  public DeliveryQuote quoteShippingForCheckout(
      String postcode, BigDecimal orderValue, int itemCount, boolean cod) {
    return shiprocketService.quoteDelivery(postcode, orderValue, itemCount, cod);
  }

  private static boolean isCodPayment(String paymentMethod) {
    return paymentMethod != null && "COD".equalsIgnoreCase(paymentMethod.trim());
  }

  private CustomerOrder buildOrderEntity(
      PlaceOrderRequest request, Long customerIdOrNull, ComputedOrder computed) {
    CustomerOrder order = new CustomerOrder();
    order.setId(UUID.randomUUID().toString());
    order.setOrderNumber(orderNumberService.nextOrderNumber());
    order.setCustomerName((request.firstName().trim() + " " + request.lastName().trim()).trim());
    order.setCustomerEmail(request.email().trim());
    order.setCustomerPhone(request.phone());
    order.setApartmentHouseNumber(trimToNull(request.apartmentHouseNumber()));
    order.setAddress(request.address().trim());
    order.setNearestLandmark(trimToNull(request.nearestLandmark()));
    order.setCity(request.city().trim());
    order.setState(trimToNull(request.state()));
    order.setPostcode(request.postcode().trim());
    order.setCountry(request.country().trim());
    order.setSubtotal(computed.subtotal());
    order.setDiscountAmount(computed.discount());
    order.setPromoCode(computed.promoCode());
    if (customerIdOrNull != null) {
      order.setCustomerId(customerIdOrNull);
    }
    order.setShipping(computed.shipping());
    order.setCodCharges(computed.codCharges());
    order.setWalletDiscount(computed.walletUse());
    order.setTotal(computed.finalTotal());
    order.setCreatedAt(Instant.now());
    return order;
  }

  private CustomerOrder loadOwnedOrder(String orderId, Long customerId) {
    if (customerId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required");
    }
    CustomerOrder order =
        orderRepository
            .findByIdWithItems(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    if (order.getCustomerId() == null || !order.getCustomerId().equals(customerId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
    }
    return order;
  }

  private static PlaceOrderRequest orderToSnapshotRequest(CustomerOrder order) {
    List<PlaceOrderRequest.OrderItemRequest> items =
        order.getItems().stream()
            .map(
                i ->
                    new PlaceOrderRequest.OrderItemRequest(
                        i.getProduct().getId(),
                        i.getSizeLabel(),
                        i.getQuantity(),
                        i.getUnitPrice()))
            .toList();
    String[] parts = order.getCustomerName().split(" ", 2);
    String first = parts.length > 0 ? parts[0] : order.getCustomerName();
    String last = parts.length > 1 ? parts[1] : "";
    return new PlaceOrderRequest(
        first,
        last,
        order.getCustomerEmail(),
        order.getCustomerPhone(),
        order.getApartmentHouseNumber(),
        order.getAddress(),
        order.getNearestLandmark(),
        order.getCity(),
        order.getState(),
        order.getPostcode(),
        order.getCountry(),
        items,
        order.getPromoCode(),
        order.getWalletDiscount(),
        order.getTotal(),
        order.getPaymentMethod());
  }

  private BigDecimal resolveWalletDiscount(
      PlaceOrderRequest request, Long customerId, BigDecimal preWalletTotal) {
    BigDecimal requested = request.walletDiscount();
    if (requested == null || requested.compareTo(BigDecimal.ZERO) <= 0) {
      return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
    if (customerId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sign in to use wallet balance");
    }
    BigDecimal reqScaled = requested.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    BigDecimal bal = walletService.getBalance(customerId);
    BigDecimal capped =
        reqScaled
            .min(bal)
            .min(preWalletTotal)
            .max(BigDecimal.ZERO)
            .setScale(2, RoundingMode.HALF_UP);
    BigDecimal expectedPayable =
        preWalletTotal.subtract(capped).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    if (request.clientTotal() != null) {
      BigDecimal clientTotal = request.clientTotal().setScale(2, RoundingMode.HALF_UP);
      BigDecimal diff = expectedPayable.subtract(clientTotal).abs();
      if (diff.compareTo(new BigDecimal("1.01")) > 0) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Order total does not match. Refresh and try again.");
      }
    }
    return capped;
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> listAdminOrders() {
    return orderRepository.findConfirmedWithItems().stream().map(this::toOrderResponse).toList();
  }

  @Transactional
  public OrderResponse markCodPaymentReceived(String orderId) {
    CustomerOrder order =
        orderRepository
            .findByIdWithItems(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    if (!"COD".equalsIgnoreCase(order.getStatus())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only COD orders can be marked as paid");
    }
    if (order.isCodPaymentReceived()) {
      return toOrderResponse(order);
    }
    order.setCodPaymentReceived(true);
    return toOrderResponse(orderRepository.save(order));
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> listOrdersForCustomer(Long customerId) {
    if (customerId == null) {
      return List.of();
    }
    // Only show orders the customer has actually committed to: paid online or
    // confirmed as COD. Orders still awaiting payment stay hidden.
    return orderRepository.findByCustomerIdWithItems(customerId).stream()
        .filter(o -> !"PAYMENT_PENDING".equalsIgnoreCase(o.getStatus()))
        .map(this::toOrderResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public StockSummaryResponse getStockSummary() {
    InventoryStock stock = getOrCreateStock();
    return toStockSummary(stock);
  }

  @Transactional
  public StockSummaryResponse updateStock(StockUpdateRequest request) {
    InventoryStock stock = getOrCreateStock();
    stock.setAlcoholStockGm(request.alcoholStockGm().setScale(2, RoundingMode.HALF_UP));
    stock.setUpdatedAt(Instant.now());
    return toStockSummary(stockRepository.save(stock));
  }

  private StockSummaryResponse toStockSummary(InventoryStock stock) {
    List<StockSummaryResponse.LowOilProduct> lowOilProducts =
        productRepository.findAllForAdmin().stream()
            .filter(p -> p.getProductOil() != null)
            .map(
                p -> {
                  boolean finished = ProductCategoryRules.isFinishedProduct(p);
                  BigDecimal remaining = p.getProductOil().setScale(2, RoundingMode.HALF_UP);
                  return new StockSummaryResponse.LowOilProduct(
                      p.getId(),
                      p.getMeladenFragrance(),
                      remaining,
                      ProductCategoryRules.isLowProductOil(p),
                      finished);
                })
            .toList();
    return new StockSummaryResponse(
        stock.getAlcoholStockGm().setScale(2, RoundingMode.HALF_UP),
        stock.getAlcoholStockGm().compareTo(LOW_ALCOHOL_THRESHOLD) <= 0,
        lowOilProducts,
        stock.getUpdatedAt());
  }

  private OrderResponse toOrderResponse(CustomerOrder o) {
    BigDecimal disc =
        o.getDiscountAmount() != null
            ? o.getDiscountAmount().setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    BigDecimal walletDisc =
        o.getWalletDiscount() != null
            ? o.getWalletDiscount().setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    return new OrderResponse(
        o.getId(),
        o.getOrderNumber(),
        o.getCustomerName(),
        o.getCustomerEmail(),
        o.getCustomerPhone(),
        o.getApartmentHouseNumber(),
        o.getAddress(),
        o.getNearestLandmark(),
        o.getCity(),
        o.getState(),
        o.getPostcode(),
        o.getCountry(),
        o.getSubtotal(),
        disc,
        o.getPromoCode(),
        o.getShipping(),
        o.getCodCharges() != null
            ? o.getCodCharges().setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
        walletDisc,
        o.getTotal(),
        o.getAlcoholUsedGm(),
        o.getStatus(),
        o.getPaymentMethod(),
        o.isCodPaymentReceived(),
        o.getTrackingAwb(),
        o.getTrackingUrl(),
        o.getCreatedAt(),
        o.getItems().stream()
            .map(
                i ->
                    new OrderResponse.OrderItemResponse(
                        i.getProduct().getId(),
                        i.getProductName(),
                        "/api/public/products/" + i.getProduct().getId() + "/image",
                        i.getSizeLabel(),
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getLineTotal(),
                        i.getOilUsedGm(),
                        i.getAlcoholUsedGm()))
            .toList());
  }

  private InventoryStock getOrCreateStock() {
    return stockRepository
        .findById(STOCK_ROW_ID)
        .orElseGet(
            () -> {
              InventoryStock stock = new InventoryStock();
              stock.setId(STOCK_ROW_ID);
              stock.setAlcoholStockGm(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
              stock.setUpdatedAt(Instant.now());
              return stockRepository.save(stock);
            });
  }

  private void validateSizeForProduct(Product product, SizeRecipe recipe) {
    boolean liquid = ProductCategoryRules.isLiquidPerfumeProduct(product);
    boolean mlSize = recipe.label().toLowerCase(Locale.ROOT).endsWith("ml");
    if (liquid && !mlSize) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Size \"" + recipe.label() + "\" is not valid for liquid perfume " + product.getMeladenFragrance());
    }
    if (!liquid && mlSize) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Size \"" + recipe.label() + "\" is not valid for " + product.getMeladenFragrance());
    }
  }

  private SizeRecipe sizeRecipe(String raw) {
    String value = raw == null ? "" : raw.toLowerCase(Locale.ROOT).replace(" ", "");
    if (value.contains("gel")) {
      return new SizeRecipe("Perfume Gel", BigDecimal.ONE, BigDecimal.ZERO);
    }
    if (value.contains("attar")) {
      return new SizeRecipe("Attar", BigDecimal.ONE, BigDecimal.ZERO);
    }
    if (value.contains("car")) {
      return new SizeRecipe("Car Perfume", BigDecimal.ONE, BigDecimal.ZERO);
    }
    if (value.contains("mist") || value.contains("body") || value.contains("hair")) {
      return new SizeRecipe("Body and Hair Mist", BigDecimal.ONE, BigDecimal.ZERO);
    }
    if (value.contains("100")) {
      return new SizeRecipe("100ml", new BigDecimal("20"), new BigDecimal("60"));
    }
    if (value.contains("30")) {
      return new SizeRecipe("30ml", new BigDecimal("6"), new BigDecimal("18"));
    }
    if (value.contains("50")) {
      return new SizeRecipe("50ml", new BigDecimal("10"), new BigDecimal("30"));
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported size: " + raw);
  }

  private record SizeRecipe(String label, BigDecimal oilPerUnitGm, BigDecimal alcoholPerUnitGm) {}

  private record ResolvedOrderItem(
      Product product,
      PlaceOrderRequest.OrderItemRequest item,
      SizeRecipe recipe,
      BigDecimal lineTotal,
      BigDecimal oilUsedGm,
      BigDecimal alcoholUsedGm) {}

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private record ComputedOrder(
      List<ResolvedOrderItem> resolved,
      BigDecimal subtotal,
      BigDecimal discount,
      String promoCode,
      BigDecimal shipping,
      BigDecimal codCharges,
      BigDecimal walletUse,
      BigDecimal finalTotal,
      BigDecimal totalAlcoholRequired) {}
}
