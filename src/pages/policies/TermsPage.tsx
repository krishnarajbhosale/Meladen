import PolicyPageLayout from '../../components/PolicyPageLayout';

export default function TermsPage() {
  return (
    <PolicyPageLayout
      title="Terms and Conditions"
      subtitle="Effective for orders and website usage on meladenperfumes.com."
    >
      <p className="mb-4 text-sm text-white/90">
        Welcome to Meladen Perfumes. By accessing and using our website (meladenperfumes.com), you agree to comply
        with and be bound by the following terms and conditions.
      </p>
      <ol className="list-decimal space-y-3 pl-5 text-sm text-white/90">
        <li>
          <strong className="text-white">General:</strong> Meladen Perfumes reserves the right to update or modify
          these terms at any time without prior notice. Continued use of the website constitutes acceptance of these
          changes.
        </li>
        <li>
          <strong className="text-white">Products and Pricing:</strong> All products listed are subject to
          availability. We reserve the right to change product prices, descriptions, or discontinue items at any time
          without notice.
        </li>
        <li>
          <strong className="text-white">Orders:</strong> We reserve the right to refuse or cancel any order due to
          product unavailability, pricing errors, or suspected fraudulent activity.
        </li>
        <li>
          <strong className="text-white">Intellectual Property:</strong> All content on this website, including images,
          logos, and text, is the property of Meladen Perfumes and may not be used without permission.
        </li>
        <li>
          <strong className="text-white">Limitation of Liability:</strong> Meladen Perfumes shall not be liable for any
          indirect, incidental, or consequential damages arising from the use of our products or website.
        </li>
        <li>
          <strong className="text-white">Governing Law:</strong> These terms shall be governed by and interpreted in
          accordance with the laws of India.
        </li>
        <li>
          <strong className="text-white">Contact Information:</strong> For any questions, please contact us at
          support.meladen@gmail.com.
        </li>
      </ol>
    </PolicyPageLayout>
  );
}
