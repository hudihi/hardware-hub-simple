import React from 'react';
import LegalLayout from '../components/LegalLayout';

const TermsPage: React.FC = () => (
  <LegalLayout title="Terms & Conditions" effectiveDate="Effective Date: April 7, 2026">

    <section>
      <p>
        Welcome to Pahala.store. These Terms & Conditions govern your use of our website and the
        purchase of goods from Pahala.store. By accessing our site or placing an order, you agree
        to these terms.
      </p>
    </section>

    <section>
      <h2>Definitions</h2>
      <ul>
        <li><strong>"Pahala.store" / "we" / "us":</strong> The operator of pahala.store.</li>
        <li><strong>"Customer" / "you":</strong> Any individual or company using the site or placing orders.</li>
        <li><strong>"Products":</strong> Engineering tools, machines, and building materials sold on Pahala.store.</li>
        <li><strong>"Order":</strong> A purchase request submitted via the website.</li>
      </ul>
    </section>

    <section>
      <h2>Order Process</h2>
      <ul>
        <li>
          <strong>Placing Orders:</strong> Orders are placed through our website. You must provide
          accurate information (delivery address, contact details). All sales are subject to
          availability and confirmation.
        </li>
        <li>
          <strong>Order Confirmation:</strong> After placing an order and processing payment, we will
          send an order confirmation with details (products, prices, delivery estimate).
        </li>
        <li>
          <strong>Prices:</strong> All prices are in Tanzanian Shillings (TZS) and include
          applicable VAT (if any). Prices may change, but confirmed orders are honored at the price
          at time of purchase.
        </li>
        <li>
          <strong>Payment:</strong> We accept M-Pesa, Airtel Money, and bank transfers. Payment must
          be completed before shipment. If payment is not received within 5 days, we reserve the
          right to cancel the order.
        </li>
      </ul>
    </section>

    <section>
      <h2>Delivery</h2>
      <ul>
        <li>
          <strong>Shipping:</strong> We deliver through our logistics network. The applicable
          delivery charge is stated at checkout and you agree to pay it.
        </li>
        <li>
          <strong>Risk of Loss:</strong> Products are your responsibility from the time of delivery
          (when you or your representative receives and signs for them).
        </li>
      </ul>
    </section>

    <section>
      <h2>Returns and Refunds</h2>
      <p>
        Our return policy is outlined in our{' '}
        <a href="/returns">Return & Refund Policy</a>. In summary: you may return defective items
        within 7 days of delivery, and we will replace or refund them as specified.
      </p>
    </section>

    <section>
      <h2>Warranty</h2>
      <p>
        Products carry a 6-month warranty for manufacturing defects from the delivery date, unless
        otherwise stated. Full details are in our{' '}
        <a href="/warranty">Warranty Policy</a>.
      </p>
    </section>

    <section>
      <h2>Liability</h2>
      <ul>
        <li>
          <strong>Limited Liability:</strong> To the maximum extent permitted by law, Pahala.store's
          liability is limited to the purchase price of the product. We are not liable for indirect,
          incidental, or consequential damages.
        </li>
        <li>
          <strong>Force Majeure:</strong> We are not liable for delays or failures caused by events
          beyond our control (e.g. natural disasters, strikes, transport disruptions).
        </li>
      </ul>
    </section>

    <section>
      <h2>Intellectual Property</h2>
      <p>
        All content on the site (text, images, logos) is owned by or licensed to Pahala.store. You
        may not copy or use our content without written permission.
      </p>
    </section>

    <section>
      <h2>User Conduct</h2>
      <p>
        You agree not to misuse the site (e.g. no hacking, spamming, or posting unlawful content).
        Fraudulent or abusive activity will result in order cancellation and possible legal action.
      </p>
    </section>

    <section>
      <h2>Governing Law</h2>
      <p>
        These Terms are governed by the laws of the United Republic of Tanzania. Any disputes will
        be subject to the jurisdiction of Tanzanian courts, consistent with the Electronic
        Transactions Act.
      </p>
    </section>

    <section>
      <h2>Amendments</h2>
      <p>
        We may modify these T&Cs at any time. Changes take effect upon posting. Continued use of
        the site after changes means you accept the new terms.
      </p>
    </section>

    <section>
      <h2>Contact Us</h2>
      <p>
        Email: <a href="mailto:support@pahala.store">support@pahala.store</a>
        <br />
        Phone: <a href="tel:+255694352388">+255 694 352 388</a>
      </p>
    </section>

  </LegalLayout>
);

export default TermsPage;
