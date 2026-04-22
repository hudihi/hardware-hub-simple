import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

export function initMonitoring() {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;
  const glitchtipDsn = import.meta.env.VITE_GLITCHTIP_DSN as string | undefined;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
      loaded: (ph) => {
        if (import.meta.env.DEV) ph.opt_out_capturing();
      },
    });
  }

  if (glitchtipDsn) {
    Sentry.init({
      dsn: glitchtipDsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      integrations: [Sentry.browserTracingIntegration()],
      beforeSend(event) {
        // Strip request body — may contain phone/payment data
        if (event.request) {
          delete event.request.data;
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
}

export function captureException(error: unknown, context?: Record<string, string>) {
  Sentry.captureException(error, { extra: context });
}
