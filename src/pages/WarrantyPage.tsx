import React from 'react';
import LegalLayout from '../components/LegalLayout';

const WarrantyPage: React.FC = () => (
  <LegalLayout title="Warranty Policy" effectiveDate="Effective Date: April 7, 2026">

    <section>
      <p>
        This Warranty Policy outlines coverage for products sold by Pahala.store.
      </p>
    </section>

    <section>
      <h2>Warranty Coverage</h2>
      <ul>
        <li>
          <strong>Products Covered:</strong> Machinery, power tools, and materials purchased from
          Pahala.store. Hand tools and consumables may have different terms as stated on the product.
        </li>
        <li>
          <strong>Duration:</strong> Each product carries a warranty of{' '}
          <strong>6 months from the delivery date</strong> for manufacturing defects, unless
          otherwise specified.
        </li>
        <li>
          <strong>What's Covered:</strong> Defects in materials or workmanship under normal use.
          For example, a motor failure on a drill due to a defective part.
        </li>
      </ul>
    </section>

    <section>
      <h2>Exclusions</h2>
      <p>Warranty does not cover:</p>
      <ul>
        <li>Damage from misuse, abuse, or negligence (e.g. using a tool beyond its rated capacity).</li>
        <li>Normal wear and tear (e.g. worn grinding discs).</li>
        <li>Unauthorized modifications or repairs by third parties.</li>
        <li>Consumable parts (e.g. batteries, blades, bits) unless defective from the factory.</li>
        <li>
          Products damaged on arrival but not reported within 48 hours (see{' '}
          <a href="/returns">Return Policy</a>).
        </li>
      </ul>
    </section>

    <section>
      <h2>Making a Warranty Claim</h2>
      <ol>
        <li>
          <strong>Notification:</strong> Contact us at{' '}
          <a href="mailto:warranty@pahala.store">warranty@pahala.store</a> with proof of purchase
          and photos of the issue.
        </li>
        <li>
          <strong>Assessment:</strong> We may request the item be returned for inspection. We cover
          shipping for approved warranty returns.
        </li>
        <li>
          <strong>Resolution:</strong> If the defect is confirmed, we will repair, replace, or
          refund (at our discretion) within <strong>14 days</strong> of receipt.
        </li>
      </ol>
    </section>

    <section>
      <h2>Limitations</h2>
      <ul>
        <li>
          Our maximum liability under warranty is limited to the purchase price of the product. We
          do not cover incidental losses (e.g. project delays).
        </li>
        <li>
          Any replacement item takes on the remainder of the original warranty period — no
          extension.
        </li>
      </ul>
    </section>

    <section>
      <h2>Consumer Rights</h2>
      <p>
        This warranty is provided in addition to your statutory rights. Under Tanzanian law, goods
        must be of satisfactory quality and fit for purpose. In case of ambiguity, the higher
        standard applies.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:warranty@pahala.store">warranty@pahala.store</a>
        <br />
        Phone: <a href="tel:+255694352388">+255 694 352 388</a>
      </p>
    </section>

  </LegalLayout>
);

export default WarrantyPage;
