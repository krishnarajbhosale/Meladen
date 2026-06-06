import { motion } from 'framer-motion';
import { pageVariants, fadeUp } from '../animations/variants';

export default function PoliciesPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] bg-brand-cream px-5 pb-16 pt-8 lg:mx-auto lg:max-w-4xl lg:px-0"
    >
      <motion.h1
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-2 font-serif text-3xl font-medium text-white lg:text-4xl"
      >
        Terms and Policies
      </motion.h1>
      <motion.p
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        className="mb-8 text-sm text-white/90"
      >
        Effective for orders and website usage on meladenperfumes.com.
      </motion.p>

      <motion.section
        id="terms"
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
        className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-white">Terms and Conditions</h2>
        <p className="mb-4 text-sm text-white/90">
          Welcome to Meladen Perfumes. By accessing and using our website (meladenperfumes.com), you agree to comply
          with and be bound by the following terms and conditions.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-white/90">
          <li>
            <strong className="text-white">General:</strong> Meladen Perfumes reserves the right to update or
            modify these terms at any time without prior notice. Continued use of the website constitutes acceptance of
            these changes.
          </li>
          <li>
            <strong className="text-white">Products and Pricing:</strong> All products listed are subject to
            availability. We reserve the right to change product prices, descriptions, or discontinue items at any
            time without notice.
          </li>
          <li>
            <strong className="text-white">Orders:</strong> We reserve the right to refuse or cancel any order
            due to product unavailability, pricing errors, or suspected fraudulent activity.
          </li>
          <li>
            <strong className="text-white">Intellectual Property:</strong> All content on this website, including
            images, logos, and text, is the property of Meladen Perfumes and may not be used without permission.
          </li>
          <li>
            <strong className="text-white">Limitation of Liability:</strong> Meladen Perfumes shall not be liable
            for any indirect, incidental, or consequential damages arising from the use of our products or website.
          </li>
          <li>
            <strong className="text-white">Governing Law:</strong> These terms shall be governed by and
            interpreted in accordance with the laws of India.
          </li>
          <li>
            <strong className="text-white">Contact Information:</strong> For any questions, please contact us at
            support.meladen@gmail.com.
          </li>
        </ol>
      </motion.section>

      <motion.section
        id="privacy"
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="visible"
        className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-2 font-serif text-2xl text-white">Privacy Policy</h2>
        <p className="mb-4 text-sm text-white/90">Last Updated: May 28, 2026</p>
        <p className="mb-4 text-sm text-white/90">
          At Méladen Perfumes (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your
          privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect,
          use, and protect the information you provide while using our website, meladenperfumes.com.
        </p>
        <ol className="list-decimal space-y-4 pl-5 text-sm text-white/90">
          <li>
            <strong className="text-white">Information We Collect</strong>
            <p className="mt-2">
              When you visit our website or place an order, we may collect the following information:
            </p>
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
              All payments are processed through secure and trusted payment gateways. Méladen Perfumes does not store
              your debit card, credit card, UPI PIN, or banking credentials.
            </p>
          </li>
          <li>
            <strong className="text-white">Sharing of Information</strong>
            <p className="mt-2">
              We do not sell, rent, or trade your personal information to third parties.
            </p>
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
              Our website may use cookies and similar technologies to improve website functionality, analyze traffic,
              and enhance user experience.
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
              By using our website or placing an order, you may receive order-related communications. Promotional
              messages or offers may be sent occasionally, and you may opt out at any time.
            </p>
          </li>
          <li>
            <strong className="text-white">Third-Party Links</strong>
            <p className="mt-2">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices
              or content of such websites.
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
              Méladen Perfumes reserves the right to modify this Privacy Policy at any time. Updates will be posted on
              this page with the revised effective date.
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
      </motion.section>

      <motion.section
        id="shipping"
        variants={fadeUp}
        custom={4}
        initial="hidden"
        animate="visible"
        className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-white">Shipping Policy</h2>
        <p className="mb-4 text-sm text-white/90">Thank you for shopping with Meladen Perfumes.</p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-white/90">
          <li>
            <strong className="text-white">Order Processing:</strong> Orders are processed within 1-2 business
            days after confirmation.
          </li>
          <li>
            <strong className="text-white">Delivery Time:</strong> Estimated delivery time is 3-7 business days
            depending on your location.
          </li>
          <li>
            <strong className="text-white">Shipping Charges:</strong> Shipping charges (if any) will be displayed
            at checkout.
          </li>
          <li>
            <strong className="text-white">Tracking:</strong> Once your order is shipped, tracking details will be
            shared via SMS/email.
          </li>
          <li>
            <strong className="text-white">Delays:</strong> Delays may occur due to unforeseen circumstances such
            as weather, courier issues, or high demand.
          </li>
          <li>
            <strong className="text-white">Incorrect Address:</strong> We are not responsible for delivery issues
            due to incorrect shipping details provided by the customer.
          </li>
          <li>
            <strong className="text-white">Contact:</strong> For shipping queries: support.meladen@gmail.com.
          </li>
        </ol>
      </motion.section>

      <motion.section
        id="returns"
        variants={fadeUp}
        custom={5}
        initial="hidden"
        animate="visible"
        className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-white">Returns and Refund Policy</h2>
        <p className="mb-4 text-sm text-white/90">
          At Meladen Perfumes, we strive to deliver high-quality products and ensure customer satisfaction.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-white/90">
          <li>
            <strong className="text-white">Returns:</strong> Returns are accepted only if the product is damaged
            or defective at the time of delivery.
          </li>
          <li>
            <strong className="text-white">Return Request:</strong> Customers must raise a return request within
            24 hours of delivery by providing proper proof, including clear photos and an unboxing video.
          </li>
          <li>
            <strong className="text-white">Non-Returnable Items:</strong> Due to hygiene and safety reasons,
            opened or used perfumes are strictly not eligible for return or refund.
          </li>
          <li>
            <strong className="text-white">Refunds:</strong> Once the returned product is received and inspected
            by our team, the refund will be processed within 3-4 business days.
          </li>
          <li>
            <strong className="text-white">Mode of Refund:</strong> Refunds will be credited to the customer&apos;s
            wallet on our website. Shipping charges are non-refundable.
          </li>
          <li>
            <strong className="text-white">Exchange:</strong> Exchange is strictly not allowed under any
            circumstances.
          </li>
          <li>
            <strong className="text-white">Cancellation:</strong> Orders once placed cannot be cancelled after
            dispatch.
          </li>
          <li>
            <strong className="text-white">Contact:</strong> To initiate a return request, please contact
            support.meladen@gmail.com.
          </li>
        </ol>
      </motion.section>

      <motion.section
        id="jurisdiction"
        variants={fadeUp}
        custom={6}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-white">Law of Jurisdiction</h2>
        <p className="text-sm leading-relaxed text-white/90">
          All disputes arising out of or in connection with the use of this website or purchase of products shall be
          subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra, India.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/90">
          These terms shall be governed by and interpreted in accordance with the laws of India.
        </p>
      </motion.section>
    </motion.div>
  );
}
