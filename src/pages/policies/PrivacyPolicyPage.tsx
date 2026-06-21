import PolicyPageLayout from '../../components/PolicyPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      subtitle="Last Updated: May 28, 2026 · Effective for meladenperfumes.com."
    >
      <p className="mb-4 text-sm text-white/90">
        At Méladen Perfumes (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your
        privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use,
        and protect the information you provide while using our website, meladenperfumes.com.
      </p>
      <ol className="list-decimal space-y-4 pl-5 text-sm text-white/90">
        <li>
          <strong className="text-white">Information We Collect</strong>
          <p className="mt-2">When you visit our website or place an order, we may collect the following information:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Name</li>
            <li>Mobile Number</li>
            <li>Email Address</li>
            <li>Shipping and Billing Address</li>
            <li>Order Details</li>
            <li>Payment Information (processed securely through third-party payment providers)</li>
            <li>Device and browser information</li>
          </ul>
        </li>
        <li>
          <strong className="text-white">How We Use Your Information</strong>
          <p className="mt-2">We use the information collected to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and fulfill orders</li>
            <li>Provide customer support</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and website experience</li>
            <li>Respond to inquiries and requests</li>
            <li>Send promotional offers and updates (only when applicable)</li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Payment Security</strong>
          <p className="mt-2">
            All payments are processed through secure and trusted payment gateways. Méladen Perfumes does not store your
            debit card, credit card, UPI PIN, or banking credentials.
          </p>
        </li>
        <li>
          <strong className="text-white">Sharing of Information</strong>
          <p className="mt-2">We do not sell, rent, or trade your personal information to third parties.</p>
          <p className="mt-2">Your information may only be shared with:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Delivery and courier partners</li>
            <li>Payment gateway providers</li>
            <li>Service providers involved in order fulfillment</li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Cookies</strong>
          <p className="mt-2">
            Our website may use cookies and similar technologies to improve website functionality, analyze traffic, and
            enhance user experience.
          </p>
          <p className="mt-2">You may disable cookies through your browser settings if preferred.</p>
        </li>
        <li>
          <strong className="text-white">Data Security</strong>
          <p className="mt-2">
            We take reasonable measures to protect your personal information against unauthorized access, misuse,
            disclosure, or alteration.
          </p>
        </li>
        <li>
          <strong className="text-white">Marketing Communications</strong>
          <p className="mt-2">
            By using our website or placing an order, you may receive order-related communications. Promotional messages
            or offers may be sent occasionally, and you may opt out at any time.
          </p>
        </li>
        <li>
          <strong className="text-white">Third-Party Links</strong>
          <p className="mt-2">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices or
            content of such websites.
          </p>
        </li>
        <li>
          <strong className="text-white">Your Rights</strong>
          <p className="mt-2">You may contact us to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information where applicable</li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Changes to This Policy</strong>
          <p className="mt-2">
            Méladen Perfumes reserves the right to modify this Privacy Policy at any time. Updates will be posted on this
            page with the revised effective date.
          </p>
        </li>
        <li>
          <strong className="text-white">Contact Us</strong>
          <p className="mt-2">For any privacy-related questions or concerns, please contact:</p>
          <p className="mt-2 text-white">Méladen Perfumes</p>
          <p className="mt-1">
            Email:{' '}
            <a href="mailto:support.meladen@gmail.com" className="text-white underline">
              support.meladen@gmail.com
            </a>
          </p>
          <p className="mt-1">Website: meladenperfumes.com</p>
        </li>
      </ol>
    </PolicyPageLayout>
  );
}
