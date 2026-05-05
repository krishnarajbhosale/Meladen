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
        className="mb-2 font-serif text-3xl font-medium text-brand-dark lg:text-4xl"
      >
        Terms and Policies
      </motion.h1>
      <motion.p
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        className="mb-8 text-sm text-brand-gray"
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
        <h2 className="mb-4 font-serif text-2xl text-brand-dark">Terms and Conditions</h2>
        <p className="mb-4 text-sm text-brand-gray">
          Welcome to Meladen Perfumes. By accessing and using our website (meladenperfumes.com), you agree to comply
          with and be bound by the following terms and conditions.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-brand-gray">
          <li>
            <strong className="text-brand-dark">General:</strong> Meladen Perfumes reserves the right to update or
            modify these terms at any time without prior notice. Continued use of the website constitutes acceptance of
            these changes.
          </li>
          <li>
            <strong className="text-brand-dark">Products and Pricing:</strong> All products listed are subject to
            availability. We reserve the right to change product prices, descriptions, or discontinue items at any
            time without notice.
          </li>
          <li>
            <strong className="text-brand-dark">Orders:</strong> We reserve the right to refuse or cancel any order
            due to product unavailability, pricing errors, or suspected fraudulent activity.
          </li>
          <li>
            <strong className="text-brand-dark">Intellectual Property:</strong> All content on this website, including
            images, logos, and text, is the property of Meladen Perfumes and may not be used without permission.
          </li>
          <li>
            <strong className="text-brand-dark">Limitation of Liability:</strong> Meladen Perfumes shall not be liable
            for any indirect, incidental, or consequential damages arising from the use of our products or website.
          </li>
          <li>
            <strong className="text-brand-dark">Governing Law:</strong> These terms shall be governed by and
            interpreted in accordance with the laws of India.
          </li>
          <li>
            <strong className="text-brand-dark">Contact Information:</strong> For any questions, please contact us at
            support.meladen@gmail.com.
          </li>
        </ol>
      </motion.section>

      <motion.section
        id="shipping"
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="visible"
        className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-brand-dark">Shipping Policy</h2>
        <p className="mb-4 text-sm text-brand-gray">Thank you for shopping with Meladen Perfumes.</p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-brand-gray">
          <li>
            <strong className="text-brand-dark">Order Processing:</strong> Orders are processed within 1-2 business
            days after confirmation.
          </li>
          <li>
            <strong className="text-brand-dark">Delivery Time:</strong> Estimated delivery time is 3-7 business days
            depending on your location.
          </li>
          <li>
            <strong className="text-brand-dark">Shipping Charges:</strong> Shipping charges (if any) will be displayed
            at checkout.
          </li>
          <li>
            <strong className="text-brand-dark">Tracking:</strong> Once your order is shipped, tracking details will be
            shared via SMS/email.
          </li>
          <li>
            <strong className="text-brand-dark">Delays:</strong> Delays may occur due to unforeseen circumstances such
            as weather, courier issues, or high demand.
          </li>
          <li>
            <strong className="text-brand-dark">Incorrect Address:</strong> We are not responsible for delivery issues
            due to incorrect shipping details provided by the customer.
          </li>
          <li>
            <strong className="text-brand-dark">Contact:</strong> For shipping queries: support.meladen@gmail.com.
          </li>
        </ol>
      </motion.section>

      <motion.section
        id="returns"
        variants={fadeUp}
        custom={4}
        initial="hidden"
        animate="visible"
        className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-brand-dark">Returns and Refund Policy</h2>
        <p className="mb-4 text-sm text-brand-gray">
          At Meladen Perfumes, we strive to deliver high-quality products and ensure customer satisfaction.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-brand-gray">
          <li>
            <strong className="text-brand-dark">Returns:</strong> Returns are accepted only if the product is damaged
            or defective at the time of delivery.
          </li>
          <li>
            <strong className="text-brand-dark">Return Request:</strong> Customers must raise a return request within
            24 hours of delivery by providing proper proof, including clear photos and an unboxing video.
          </li>
          <li>
            <strong className="text-brand-dark">Non-Returnable Items:</strong> Due to hygiene and safety reasons,
            opened or used perfumes are strictly not eligible for return or refund.
          </li>
          <li>
            <strong className="text-brand-dark">Refunds:</strong> Once the returned product is received and inspected
            by our team, the refund will be processed within 3-4 business days.
          </li>
          <li>
            <strong className="text-brand-dark">Mode of Refund:</strong> Refunds will be credited to the customer&apos;s
            wallet on our website. Shipping charges are non-refundable.
          </li>
          <li>
            <strong className="text-brand-dark">Exchange:</strong> Exchange is strictly not allowed under any
            circumstances.
          </li>
          <li>
            <strong className="text-brand-dark">Cancellation:</strong> Orders once placed cannot be cancelled after
            dispatch.
          </li>
          <li>
            <strong className="text-brand-dark">Contact:</strong> To initiate a return request, please contact
            support.meladen@gmail.com.
          </li>
        </ol>
      </motion.section>

      <motion.section
        id="jurisdiction"
        variants={fadeUp}
        custom={5}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        <h2 className="mb-4 font-serif text-2xl text-brand-dark">Law of Jurisdiction</h2>
        <p className="text-sm leading-relaxed text-brand-gray">
          All disputes arising out of or in connection with the use of this website or purchase of products shall be
          subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra, India.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-brand-gray">
          These terms shall be governed by and interpreted in accordance with the laws of India.
        </p>
      </motion.section>
    </motion.div>
  );
}
