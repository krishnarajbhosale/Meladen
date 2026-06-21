import PolicyPageLayout from '../../components/PolicyPageLayout';

export default function ShippingPolicyPage() {
  return (
    <PolicyPageLayout title="Shipping Policy" subtitle="Thank you for shopping with Meladen Perfumes.">
      <ol className="list-decimal space-y-3 pl-5 text-sm text-white/90">
        <li>
          <strong className="text-white">Order Processing:</strong> Orders are processed within 1-2 business days after
          confirmation.
        </li>
        <li>
          <strong className="text-white">Delivery Time:</strong> Estimated delivery time is 3-7 business days depending on
          your location.
        </li>
        <li>
          <strong className="text-white">Shipping Charges:</strong> Shipping charges (if any) will be displayed at
          checkout.
        </li>
        <li>
          <strong className="text-white">Tracking:</strong> Once your order is shipped, tracking details will be shared
          via SMS/email.
        </li>
        <li>
          <strong className="text-white">Delays:</strong> Delays may occur due to unforeseen circumstances such as
          weather, courier issues, or high demand.
        </li>
        <li>
          <strong className="text-white">Incorrect Address:</strong> We are not responsible for delivery issues due to
          incorrect shipping details provided by the customer.
        </li>
        <li>
          <strong className="text-white">Contact:</strong> For shipping queries: support.meladen@gmail.com.
        </li>
      </ol>
    </PolicyPageLayout>
  );
}
