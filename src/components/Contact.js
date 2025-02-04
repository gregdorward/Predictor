import React from "react";

const StripePolicies = () => {
  return (
    <div className="ContactText">
      <h2 className="text-2xl font-bold mb-4">XGTipping Policies</h2>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Customer Support</h2>
        <p>For any inquiries, please contact us via:</p>
        <ul className="list-disc ml-6">
          <li>Email: <a href="mailto:support@xgtipping.com" className="text-blue-500">support@xgtipping.com</a></li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Refund and Dispute Policy</h2>
        <p>
          Due to the digital nature of our services, all payments are final, and we do not offer refunds. 
          If you experience technical issues preventing access, please contact our support team.
        </p>
        <p>
          If you believe you have been charged incorrectly, reach out to us before initiating a chargeback. 
          We will review and resolve the issue promptly.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Cancellation Policy</h2>
        <p>
          You may cancel your subscription anytime through your account settings. Cancellations prevent future billing, 
          but no refunds are issued for unused time. Access remains active until the end of the billing cycle.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Legal and Export Restrictions</h2>
        <p>
          XGTipping is available only in jurisdictions where online tipping and sports analysis services are legally permitted. 
          Users are responsible for ensuring compliance with local laws.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Terms and Conditions of Promotions</h2>
        <p>
          Any promotions, free trials, or discounts offered are subject to change or termination at XGTipping’s discretion. 
          Promotional offers cannot be combined unless explicitly stated. If a promotion is tied to a subscription, 
          standard billing resumes after the promotional period unless canceled before renewal.
        </p>
      </section>
    </div>
  );
};

export default StripePolicies;
