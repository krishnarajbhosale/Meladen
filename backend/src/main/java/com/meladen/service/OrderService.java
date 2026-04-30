package com.meladen.service;

import com.meladen.dto.OrderResponse;
import com.meladen.dto.PlaceOrderRequest;
import com.meladen.dto.StockSummaryResponse;
import com.meladen.dto.StockUpdateRequest;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.CustomerOrderItem;
import com.meladen.entity.InventoryStock;
import com.meladen.entity.Product;
import com.meladen.repository.CustomerOrderRepository;
import com.meladen.repository.InventoryStockRepository;
import com.meladen.repository.ProductRepository;
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
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OrderService {

  private static final Long STOCK_ROW_ID = 1L;
  private static final BigDecimal LOW_ALCOHOL_THRESHOLD = new BigDecimal("200");
  private static final BigDecimal LOW_PRODUCT_OIL_THRESHOLD = new BigDecimal("100");
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("150");
  private static final BigDecimal SHIPPING_FEE = new BigDecimal("12");

  private final ProductRepository productRepository;
  private final InventoryStockRepository stockRepository;
  private final CustomerOrderRepository orderRepository;

  @Transactional
  public OrderResponse placeOrder(PlaceOrderRequest request) {
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
              .findById(item.productId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product: " + item.productId()));
      SizeRecipe recipe = sizeRecipe(item.size());
      int qty = item.quantity();
      BigDecimal qtyDecimal = BigDecimal.valueOf(qty);

      BigDecimal oilRequired = recipe.oilPerUnitGm().multiply(qtyDecimal);
      BigDecimal alcoholRequired = recipe.alcoholPerUnitGm().multiply(qtyDecimal);
      BigDecimal lineTotal = item.unitPrice().multiply(qtyDecimal).setScale(2, RoundingMode.HALF_UP);

      if (product.getProductOil() == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Product oil stock not set for " + product.getMeladenFragrance());
      }
      if (product.getProductOil().compareTo(oilRequired) < 0) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Insufficient product oil for " + product.getMeladenFragrance());
      }

      subtotal = subtotal.add(lineTotal);
      totalAlcoholRequired = totalAlcoholRequired.add(alcoholRequired);
      resolved.add(new ResolvedOrderItem(product, item, recipe, lineTotal, oilRequired, alcoholRequired));
    }

    if (stock.getAlcoholStockGm().compareTo(totalAlcoholRequired) < 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient alcohol stock");
    }

    for (ResolvedOrderItem row : resolved) {
      Product p = row.product();
      p.setProductOil(p.getProductOil().subtract(row.oilUsedGm()).setScale(2, RoundingMode.HALF_UP));
    }
    stock.setAlcoholStockGm(stock.getAlcoholStockGm().subtract(totalAlcoholRequired).setScale(2, RoundingMode.HALF_UP));
    stock.setUpdatedAt(Instant.now());

    BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
    BigDecimal total = subtotal.add(shipping).setScale(2, RoundingMode.HALF_UP);

    CustomerOrder order = new CustomerOrder();
    order.setId(UUID.randomUUID().toString());
    order.setOrderNumber("MLD-" + System.currentTimeMillis());
    order.setCustomerName((request.firstName().trim() + " " + request.lastName().trim()).trim());
    order.setCustomerEmail(request.email().trim());
    order.setCustomerPhone(request.phone());
    order.setAddress(request.address().trim());
    order.setCity(request.city().trim());
    order.setPostcode(request.postcode().trim());
    order.setCountry(request.country().trim());
    order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
    order.setShipping(shipping.setScale(2, RoundingMode.HALF_UP));
    order.setTotal(total);
    order.setAlcoholUsedGm(totalAlcoholRequired.setScale(2, RoundingMode.HALF_UP));
    order.setStatus("PLACED");
    order.setCreatedAt(Instant.now());

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
      items.add(oi);
    }
    order.setItems(items);

    productRepository.saveAll(resolved.stream().map(ResolvedOrderItem::product).toList());
    stockRepository.save(stock);
    CustomerOrder savedOrder = orderRepository.save(order);
    return toOrderResponse(savedOrder);
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> listAdminOrders() {
    return orderRepository.findAllWithItems().stream().map(this::toOrderResponse).toList();
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
                p ->
                    new StockSummaryResponse.LowOilProduct(
                        p.getId(),
                        p.getMeladenFragrance(),
                        p.getProductOil().setScale(2, RoundingMode.HALF_UP),
                        p.getProductOil().compareTo(LOW_PRODUCT_OIL_THRESHOLD) <= 0))
            .toList();
    return new StockSummaryResponse(
        stock.getAlcoholStockGm().setScale(2, RoundingMode.HALF_UP),
        stock.getAlcoholStockGm().compareTo(LOW_ALCOHOL_THRESHOLD) <= 0,
        lowOilProducts,
        stock.getUpdatedAt());
  }

  private OrderResponse toOrderResponse(CustomerOrder o) {
    return new OrderResponse(
        o.getId(),
        o.getOrderNumber(),
        o.getCustomerName(),
        o.getCustomerEmail(),
        o.getCustomerPhone(),
        o.getAddress(),
        o.getCity(),
        o.getPostcode(),
        o.getCountry(),
        o.getSubtotal(),
        o.getShipping(),
        o.getTotal(),
        o.getAlcoholUsedGm(),
        o.getStatus(),
        o.getCreatedAt(),
        o.getItems().stream()
            .map(
                i ->
                    new OrderResponse.OrderItemResponse(
                        i.getProduct().getId(),
                        i.getProductName(),
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

  private SizeRecipe sizeRecipe(String raw) {
    String value = raw == null ? "" : raw.toLowerCase(Locale.ROOT).replace(" ", "");
    if (value.contains("30")) {
      return new SizeRecipe("30ml", new BigDecimal("6"), new BigDecimal("18"));
    }
    if (value.contains("50")) {
      return new SizeRecipe("50ml", new BigDecimal("10"), new BigDecimal("30"));
    }
    if (value.contains("100")) {
      return new SizeRecipe("100ml", new BigDecimal("20"), new BigDecimal("60"));
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
}
