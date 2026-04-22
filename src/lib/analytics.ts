import posthog from 'posthog-js';

// All functions must be PII-free: no phone numbers, no OTP, no payment numbers.
export const analytics = {
  addedToCart(props: { product_id: string; category?: string; price: number }) {
    posthog.capture('added_to_cart', {
      product_id: props.product_id,
      category: props.category ?? 'unknown',
      price: props.price,
    });
  },

  checkoutStarted(props: { item_count: number; total: number }) {
    posthog.capture('checkout_started', props);
  },

  orderSubmitted(props: { item_count: number; total: number }) {
    posthog.capture('order_submitted', props);
  },

  otpRequested() {
    posthog.capture('otp_requested');
  },

  otpVerified() {
    posthog.capture('otp_verified');
  },

  confirmationViewed() {
    posthog.capture('confirmation_viewed');
  },

  paymentProofUploaded(props: { file_count: number }) {
    posthog.capture('payment_proof_uploaded', props);
  },

  uploadError(props: { reason: string }) {
    posthog.capture('upload_error', { reason: props.reason });
  },
};
