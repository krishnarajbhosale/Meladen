import PolicyPageLayout from '../../components/PolicyPageLayout';

export default function ReturnsRefundPolicyPage() {
  return (
    <PolicyPageLayout
      title="Returns and Refund Policy"
      subtitle="At Meladen Perfumes, we strive to deliver high-quality products and ensure customer satisfaction."
    >
      <ol className="list-decimal space-y-3 pl-5 text-sm text-white/90">
        <li>
          <strong className="text-white">Returns:</strong> Returns are accepted only if the product is damaged or
          defective at the time of delivery.
        </li>
        <li>
          <strong className="text-white">Return Request:</strong> Customers must raise a return request within 24 hours
          of delivery by providing proper proof, including clear photos and an unboxing video.
        </li>
        <li>
          <strong className="text-white">Non-Returnable Items:</strong> Due to hygiene and safety reasons, opened or used
          perfumes are strictly not eligible for return or refund.
        </li>
        <li>
          <strong className="text-white">Refunds:</strong> Once the returned product is received and inspected by our
          team, the refund will be processed within 3-4 business days.
        </li>
        <li>
          <strong className="text-white">Mode of Refund:</strong> Refunds will be credited to the customer&apos;s wallet
          on our website. Shipping charges are non-refundable.
        </li>
        <li>
          <strong className="text-white">Exchange:</strong> Exchange is strictly not allowed under any circumstances.
        </li>
        <li>
          <strong className="text-white">Cancellation:</strong> Orders once placed cannot be cancelled after dispatch.
        </li>
        <li>
          <strong className="text-white">Contact:</strong> To initiate a return request, please contact
          support.meladen@gmail.com.
        </li>
      </ol>
    </PolicyPageLayout>
  );
}
