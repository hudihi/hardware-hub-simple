import React from 'react';
import LegalLayout from '../components/LegalLayout';

const ShippingPolicyPage: React.FC = () => (
  <LegalLayout title="Shipping & Delivery Policy" effectiveDate="Effective Date: April 7, 2026">

    <section>
      <p>
        Pahala.store handles shipping through our own logistics network. This policy explains our
        delivery methods, timelines, and costs.
      </p>
    </section>

    <section>
      <h2>Delivery Regions</h2>
      <ul>
        <li><strong>Urban Areas:</strong> Major cities — Dar es Salaam, Arusha, Dodoma, Mwanza, and others.</li>
        <li><strong>Rural / Remote Areas:</strong> Smaller towns and outlying regions across Tanzania.</li>
        <li><strong>International:</strong> Pahala.store currently ships only within Tanzania.</li>
      </ul>
    </section>

    <section>
      <h2>Delivery Timelines</h2>
      <p>
        These estimates assume orders are placed before 12:00 pm on working days.
      </p>
      <ul>
        <li>
          <strong>Urban Deliveries:</strong> Typically <strong>1–2 business days</strong> from
          shipment. We target 85% next-day delivery in major cities.
        </li>
        <li>
          <strong>Rural Deliveries:</strong> <strong>3–5 business days</strong> (may extend to 7
          days for very remote locations). We target 88% of these within 3 days.
        </li>
      </ul>
      <p>
        <em>Example:</em> A tool ordered in Dar es Salaam on Monday morning should arrive by
        Tuesday or Wednesday. An order to a village outside Dodoma may arrive by Friday.
      </p>
    </section>

    <section>
      <h2>Shipping Costs</h2>
      <ul>
        <li>
          A flat delivery fee is calculated at checkout based on weight and destination.
        </li>
        <li>
          Free delivery promotions may apply on minimum order values or during special campaigns.
        </li>
        <li>
          Additional charges may apply for bulky items (e.g. machines). These are displayed before
          you complete the purchase.
        </li>
      </ul>
    </section>

    <section>
      <h2>Delivery Process</h2>
      <ol>
        <li>
          <strong>Order Dispatch:</strong> Once confirmed and packed, your order is dispatched from
          our warehouse. You receive a dispatch notification with tracking information.
        </li>
        <li>
          <strong>In-Transit:</strong> Our system tracks the package until delivered. View status
          online via the tracking link in your notification.
        </li>
        <li>
          <strong>Arrival:</strong> Our delivery agent will call you before arriving. Please provide
          special instructions if needed (e.g. gate code or landmark).
        </li>
        <li>
          <strong>Receipt:</strong> Sign or acknowledge receipt. If you are not available, the agent
          may leave the parcel safely at your premises or schedule a re-delivery.
        </li>
      </ol>
    </section>

    <section>
      <h2>Missed Deliveries</h2>
      <ul>
        <li>
          If we cannot reach you, we will attempt one re-delivery. Further attempts may incur
          additional fees.
        </li>
        <li>
          Provide an accurate address and reachable phone number. Delays caused by incorrect
          information are the customer's responsibility.
        </li>
      </ul>
    </section>

    <section>
      <h2>Tracking and Notifications</h2>
      <p>
        We send SMS/email updates at key stages: Order Received, Dispatched, Out for Delivery, and
        Delivered. You can also log in to your account to track orders in real time.
      </p>
    </section>

    <section>
      <h2>Delays</h2>
      <p>
        In rare cases (bad weather, strikes), deliveries may be delayed. We will inform you
        promptly and provide an updated delivery estimate.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:support@pahala.store">support@pahala.store</a>
        <br />
        Phone: <a href="tel:+255694352388">+255 694 352 388</a>
      </p>
    </section>

  </LegalLayout>
);

export default ShippingPolicyPage;
