import React from 'react';
import LegalLayout from '../components/LegalLayout';

const PrivacyPolicyPage: React.FC = () => (
  <LegalLayout title="Privacy Policy" effectiveDate="Last Updated: April 7, 2026">

    <section>
      <p>
        Pahala.store ("we", "us", or "our") is committed to protecting your privacy. This Privacy
        Policy explains how we collect, use, and safeguard the personal data of customers and
        visitors to pahala.store. It complies with Tanzania's Personal Data Protection Act, 2022
        (PDPA) and other applicable laws. By using our website and services, you consent to the
        practices described below.
      </p>
    </section>

    <section>
      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Personal Information:</strong> We collect data you provide when placing an order —
          your name, delivery address, email, phone number, and payment details (e.g. M-Pesa or
          bank account information).
        </li>
        <li>
          <strong>Usage Data:</strong> When you browse our website, we automatically collect
          information about your visit (IP address, browser type, pages viewed, etc.) via cookies
          and analytics tools.
        </li>
        <li>
          <strong>Transaction Data:</strong> Details of products you purchase (item SKU, price,
          quantity) and transaction records.
        </li>
        <li>
          <strong>Communications:</strong> Any information you include in messages to us (inquiries,
          feedback).
        </li>
      </ul>
      <p>
        All data is collected lawfully and with your consent. We do not collect sensitive data such
        as health information or personal identifiers beyond what is needed for ordering and
        delivery.
      </p>
    </section>

    <section>
      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>
          <strong>Order Fulfillment:</strong> To process and deliver your orders using your name,
          address, and contact details. Payment information is used only to complete transactions
          securely.
        </li>
        <li>
          <strong>Customer Service:</strong> To respond to your inquiries, provide support, and
          improve service quality.
        </li>
        <li>
          <strong>Marketing & Communications:</strong> With your consent, we may send promotional
          emails or SMS about new products or offers. You can opt out anytime by contacting us or
          clicking "unsubscribe."
        </li>
        <li>
          <strong>Legal Compliance:</strong> To comply with laws and regulations (e.g. tax records,
          consumer protection requirements).
        </li>
        <li>
          <strong>Security & Improvement:</strong> We analyze usage data to improve our website and
          detect fraud or unauthorized use.
        </li>
      </ul>
      <p>
        <strong>We will not sell or rent your personal data to third parties.</strong> Data sharing
        is limited to: (a) logistics partners who deliver your orders, bound by confidentiality
        agreements; (b) licensed payment processors (M-Pesa, Airtel Money, banks) under Bank of
        Tanzania regulations; and (c) legal authorities when required by law.
      </p>
    </section>

    <section>
      <h2>3. Data Storage and Security</h2>
      <ul>
        <li>
          <strong>Storage:</strong> Your data is stored on secure servers with encryption and access
          controls in accordance with international standards (ISO 9001).
        </li>
        <li>
          <strong>Retention:</strong> We retain your information for as long as your account is
          active or as needed to provide services. Transaction records are kept per financial
          regulations. Data no longer needed is securely deleted or anonymized.
        </li>
        <li>
          <strong>Security Measures:</strong> We implement firewalls, SSL/TLS encryption for data
          in transit, and regular security audits. Employees and partners with access to personal
          data are trained on confidentiality.
        </li>
      </ul>
    </section>

    <section>
      <h2>4. Your Rights</h2>
      <p>
        Under Tanzanian law (PDPA 2022), you have the following rights regarding your personal data:
      </p>
      <ul>
        <li>
          <strong>Access & Correction:</strong> Request access to the personal data we hold about
          you and request corrections.
        </li>
        <li>
          <strong>Data Erasure:</strong> Ask to delete your data (e.g. close your account), subject
          to legal obligations to retain records.
        </li>
        <li>
          <strong>Data Portability:</strong> Request a copy of your data in a common format.
        </li>
        <li>
          <strong>Consent Withdrawal:</strong> Withdraw consent for marketing communications at any
          time.
        </li>
        <li>
          <strong>Complaint:</strong> Lodge a complaint with the Personal Data Protection Commission
          (PDPC) if you believe we have violated data protection laws.
        </li>
      </ul>
      <p>
        Requests should be made by email to{' '}
        <a href="mailto:privacy@pahala.store">privacy@pahala.store</a>. We will respond within 30
        days as required by law.
      </p>
    </section>

    <section>
      <h2>5. Cookies and Tracking</h2>
      <p>
        Our website uses cookies to improve functionality and user experience, including analytics
        and session cookies. You can control cookies via your browser settings. Non-essential
        cookies can be disabled, though this may affect your experience.
      </p>
    </section>

    <section>
      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy to reflect changes in law or our practices. The "Last
        Updated" date will change accordingly. Significant changes will be communicated via email or
        site notification.
      </p>
    </section>

    <section>
      <h2>Contact Us</h2>
      <p>
        Email: <a href="mailto:privacy@pahala.store">privacy@pahala.store</a>
        <br />
        Phone: <a href="tel:+255694352388">+255 694 352 388</a>
      </p>
    </section>

  </LegalLayout>
);

export default PrivacyPolicyPage;
