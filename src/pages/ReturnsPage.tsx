import React from 'react';
import LegalLayout from '../components/LegalLayout';

const ReturnsPage: React.FC = () => (
  <LegalLayout title="Return & Refund Policy" effectiveDate="Effective Date: April 7, 2026">

    <section>
      <p>
        Pahala.store strives to ensure customer satisfaction. This policy explains how returns and
        refunds are handled.
      </p>
    </section>

    <section>
      <h2>Defective or Incorrect Products</h2>
      <ul>
        <li>
          If you receive a defective or incorrect item, notify us within{' '}
          <strong>48 hours of delivery</strong>.
        </li>
        <li>
          We will provide instructions for returning the item (pickup or drop-off). Return shipping
          costs are covered by Pahala.store in these cases.
        </li>
        <li>
          Upon receiving the returned product and confirming the issue, we will{' '}
          <strong>replace it or refund your payment (your choice)</strong> within 7 working days.
        </li>
      </ul>
    </section>

    <section>
      <h2>General Returns</h2>
      <h3>Change of Mind</h3>
      <p>
        For non-defective products, we do not generally accept returns for change of mind,
        especially for customized or non-storable items.
      </p>

      <h3>Unwanted Items</h3>
      <p>
        If an item is unused and in original packaging, we may accept returns at our discretion
        within <strong>7 days of delivery</strong>. You must email us within that period. Return
        shipping is at your expense, and a 10% restocking fee may apply.
      </p>
    </section>

    <section>
      <h2>Refunds</h2>
      <ul>
        <li>Refunds are processed to the original payment method.</li>
        <li>
          For mobile money payments, refunds may take up to <strong>14 days</strong> to appear,
          depending on the provider.
        </li>
        <li>We will notify you by email once the refund is completed.</li>
      </ul>
    </section>

    <section>
      <h2>Warranty Claims</h2>
      <p>
        Warranty claims for manufacturing defects are processed per our{' '}
        <a href="/warranty">Warranty Policy</a>. Defective returns outside the 48-hour window but
        within the warranty period will be handled under warranty terms.
      </p>
    </section>

    <section>
      <h2>Exceptions</h2>
      <p>
        Certain items (e.g. consumables, perishables, opened software) cannot be returned unless
        faulty. In all cases, we comply with Tanzania's consumer protection regulations and the
        Electronic Transactions Act guidelines for returns and refunds.
      </p>
    </section>

    <section>
      <h2>How to Initiate a Return</h2>
      <p>
        Email <a href="mailto:returns@pahala.store">returns@pahala.store</a> with your order
        number and a description of the issue. Provide photos or videos of any defect to speed
        processing.
      </p>
    </section>

  </LegalLayout>
);

export default ReturnsPage;
