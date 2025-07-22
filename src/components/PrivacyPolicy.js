import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="ContactText">
      <h2 className="text-2xl font-bold mb-4">Soccer Stats Hub Policies</h2>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Customer Support</h2>
        <p>For any inquiries, please contact us via:</p>
        <ul className="list-disc ml-6">
          <li>Email: <a href="mailto:support@xgtipping.com" className="text-blue-500">support@xgtipping.com</a></li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Privacy Policy</h2>
        <p>
          Effective Date: 22/07/2025

          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website.


          1. Information We Collect
          a. Account Information
          Email address – collected when you register or log in.

          Password – stored securely using industry-standard encryption.

          b. Payment Information
          We use Stripe to process all payments.

          We do not store your credit or debit card information on our servers.

          Please review Stripe’s Privacy Policy for details on how they manage your payment data.

          c. Automatically Collected Data
          We may collect anonymized data such as IP address, browser type, and usage statistics to help improve our service.

        </p>
        <p>

          2. How We Use Your Information
          We use your personal information to:

          Provide access to paid features and services,

          Authenticate your account,

          Process payments through Stripe,

          Communicate with you about your account or service updates,

          Comply with legal obligations.

          We do not sell or rent your personal data to third parties.

        </p>
        <p>
          3. How We Share Your Information
          We may share your information with:

          Stripe, for payment processing,

          Service providers who assist with hosting or technical support,

          Authorities if required by law or to protect our legal rights.

          All third parties are bound by strict data protection obligations.

        </p>
        <p>
          4. Data Retention
          We retain your information:

          For as long as your account is active,

          As needed to provide our services,

          Or as required by law (e.g. for financial or legal obligations).

          You can request account deletion by contacting us (see Section 8).

        </p>
        <p>
          5. Your Rights
          Depending on your location, you may have the right to:

          Access or request a copy of your data,

          Correct or delete your personal information,

          Withdraw consent or object to certain processing,

          File a complaint with a data protection authority.
        </p>
        <p>
          6. Data Security
          We take appropriate technical and organisational measures to protect your data, including:

          Secure encryption of passwords,

          Secure connections (HTTPS),

          Regular security reviews.
        </p>
        <p>

          7. Cookies & Tracking
          We may use cookies or similar technologies to improve your experience. You can manage your cookie preferences in your browser settings.
        </p>
        <p>
          8. Contact Us
          If you have questions or concerns about this Privacy Policy or your personal data, please contact us:

          Email: support@xgtipping.com
        </p>
        <p>
          9. Changes to This Policy
          We may update this Privacy Policy occasionally. We'll notify you of any material changes via email or website notice.

          Compliance Notice
          This Privacy Policy is designed to comply with:

          The General Data Protection Regulation (GDPR),

          The California Consumer Privacy Act (CCPA),

          Reddit Ads policies and guidelines.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
