const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-20 mb-16 leading-7">
      <h1 className="text-3xl font-bold mb-4">Refund & Cancellation Policy</h1>

      <p>
        We strive to provide a smooth shopping experience. Please read our
        refund and cancellation policy carefully.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Order Cancellation</h2>
      <p>
        Orders can be cancelled before they are shipped. Once shipped,
        cancellation is not allowed.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Refund Policy</h2>
      <p>
        Refunds for prepaid orders will be processed back to the original
        payment method within 5–7 working days after approval.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Return Conditions</h2>
      <ul className="list-disc ml-6">
        <li>Item must be unused</li>
        <li>Original packaging must be intact</li>
        <li>Damage caused by misuse will void refunds</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        Email: <strong>orca.unofficial@gmail.com</strong>
      </p>
    </div>
  );
};

export default RefundPolicy;
