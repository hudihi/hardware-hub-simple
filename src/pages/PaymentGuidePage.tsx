import React from 'react';
import { Link } from 'react-router-dom';
import StepAvatar, { AvatarPose } from '../components/StepAvatar';
import { useLanguage } from '../context/LanguageContext';
import { generateWhatsAppLink } from '../utils/whatsapp';

interface Step {
  pose: AvatarPose;
  icon: string;
  titleKey: string;
  descKey: string;
  tipKey?: string;
  color: string;
}

const STEPS: Step[] = [
  { pose: 'browse',     icon: 'bi-receipt',             titleKey: 'pay_step1_title', descKey: 'pay_step1_desc',                  color: '#7C5A3C' },
  { pose: 'phone',      icon: 'bi-phone-fill',           titleKey: 'pay_step2_title', descKey: 'pay_step2_desc',                  color: '#8B6347' },
  { pose: 'form',       icon: 'bi-arrow-right-circle',   titleKey: 'pay_step3_title', descKey: 'pay_step3_desc',                  color: '#9A6D52' },
  { pose: 'form',       icon: 'bi-123',                  titleKey: 'pay_step4_title', descKey: 'pay_step4_desc', tipKey: 'pay_tip4', color: '#A67C5C' },
  { pose: 'pay',        icon: 'bi-cash-coin',            titleKey: 'pay_step5_title', descKey: 'pay_step5_desc', tipKey: 'pay_tip5', color: '#B58B6B' },
  { pose: 'confirm',    icon: 'bi-shield-check-fill',    titleKey: 'pay_step6_title', descKey: 'pay_step6_desc',                  color: '#C49A7A' },
  { pose: 'screenshot', icon: 'bi-camera-fill',          titleKey: 'pay_step7_title', descKey: 'pay_step7_desc', tipKey: 'pay_tip7', color: '#8B6347' },
  { pose: 'upload',     icon: 'bi-upload',               titleKey: 'pay_step8_title', descKey: 'pay_step8_desc',                  color: '#7C5A3C' },
];

const PaymentGuidePage: React.FC = () => {
  const { t } = useLanguage();
  const waLink = generateWhatsAppLink(t('wa_hello'));

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="how-hero">
        <div className="container text-center py-5">
          <div className="how-hero-avatar mx-auto mb-4">
            <StepAvatar pose="pay" />
          </div>
          <h1 className="fw-bold mb-3 text-white">{t('pay_guide_title')}</h1>
          <p className="text-white opacity-75 mb-0 mx-auto" style={{ maxWidth: 520 }}>
            {t('pay_guide_subtitle')}
          </p>
          {/* Payment method badges */}
          <div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
            <span className="pay-guide-badge">
              <i className="bi bi-phone-fill me-1"></i> M-Pesa
            </span>
            <span className="pay-guide-badge">
              <i className="bi bi-phone-fill me-1"></i> Airtel Money
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="container py-5">
        <div className="how-timeline">
          {STEPS.map((step, index) => (
            <div key={index} className="how-step">
              {index < STEPS.length - 1 && (
                <div className="how-connector" style={{ borderColor: step.color }} />
              )}

              <div className="how-step-number" style={{ background: step.color }}>
                {index + 1}
              </div>

              <div className="how-step-card">
                <div className="how-avatar-wrap">
                  <StepAvatar pose={step.pose} />
                  <span className="how-step-badge" style={{ background: step.color }}>
                    <i className={`bi ${step.icon}`}></i>
                  </span>
                </div>

                <div className="how-step-content">
                  <h5 className="fw-bold mb-2" style={{ color: step.color }}>
                    {t(step.titleKey as any)}
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
                    {t(step.descKey as any)}
                  </p>
                  {step.tipKey && (
                    <div className="how-tip mt-3">
                      <i className="bi bi-lightbulb-fill me-2" style={{ color: step.color }}></i>
                      <span>{t(step.tipKey as any)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="how-cta text-center mt-5 pt-3">
          <div className="how-cta-avatar mx-auto mb-4">
            <StepAvatar pose="celebrate" />
          </div>
          <h4 className="fw-bold mb-2">{t('pay_cta_title')}</h4>
          <p className="text-muted mb-4">{t('pay_cta_desc')}</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg-mobile"
            >
              <i className="bi bi-whatsapp me-2"></i>
              {t('pay_cta_btn')}
            </a>
            <Link to="/orders" className="btn btn-primary btn-lg-mobile">
              <i className="bi bi-box-seam me-2"></i>
              {t('pay_track_btn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGuidePage;
