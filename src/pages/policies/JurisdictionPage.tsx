import PolicyPageLayout from '../../components/PolicyPageLayout';

export default function JurisdictionPage() {
  return (
    <PolicyPageLayout title="Law of Jurisdiction">
      <p className="text-sm leading-relaxed text-white/90">
        All disputes arising out of or in connection with the use of this website or purchase of products shall be
        subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra, India.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-white/90">
        These terms shall be governed by and interpreted in accordance with the laws of India.
      </p>
    </PolicyPageLayout>
  );
}
