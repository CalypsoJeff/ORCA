const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-20 mb-16 leading-7">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p>
        Orca (“Company”, “we”, “our”, “us”) operates the website
        https://orcasportsclub.in (“Website”). This Privacy Policy explains how
        we collect, use, and protect your personal information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Information We Collect
      </h2>
      <ul className="list-disc ml-6">
        <li>Name, email, phone number</li>
        <li>Shipping and billing address</li>
        <li>Payment information (handled securely by Razorpay)</li>
        <li>Order details and browsing activity</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Data</h2>
      <ul className="list-disc ml-6">
        <li>Process and deliver orders</li>
        <li>Customer support</li>
        <li>Fraud prevention</li>
        <li>Improving our website and services</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Sharing</h2>
      <p>
        We do <strong>not sell</strong> your personal data. We only share data
        with:
      </p>
      <ul className="list-disc ml-6">
        <li>Payment gateway (Razorpay)</li>
        <li>Logistics and delivery partners</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        Email: <strong>orca.unofficial@gmail.com</strong>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
