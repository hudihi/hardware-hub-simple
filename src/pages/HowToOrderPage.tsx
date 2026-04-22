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
  { pose: 'browse',    icon: 'bi-grid-fill',         titleKey: 'how_step1_title', descKey: 'how_step1_desc', color: '#7C5A3C' },
  { pose: 'cart',      icon: 'bi-cart-plus-fill',    titleKey: 'how_step2_title', descKey: 'how_step2_desc', color: '#8B6347' },
  { pose: 'form',      icon: 'bi-person-lines-fill', titleKey: 'how_step3_title', descKey: 'how_step3_desc', color: '#9A6D52' },
  { pose: 'phone',     icon: 'bi-shield-check-fill', titleKey: 'how_step4_title', descKey: 'how_step4_desc', tipKey: 'how_tip4', color: '#A67C5C' },
  { pose: 'pay',       icon: 'bi-cash-coin',          titleKey: 'how_step5_title', descKey: 'how_step5_desc', tipKey: 'how_tip5', color: '#B58B6B' },
  { pose: 'upload',    icon: 'bi-upload',             titleKey: 'how_step6_title', descKey: 'how_step6_desc', tipKey: 'how_tip6', color: '#C49A7A' },
  { pose: 'celebrate', icon: 'bi-box-seam-fill',      titleKey: 'how_step7_title', descKey: 'how_step7_desc', color: '#D3A989' },
];

const HowToOrderPage: React.FC = () => {
  const { t } = useLanguage();
  const waLink = generateWhatsAppLink(t('wa_hello'));

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="how-hero">
        <div className="container text-center py-5">
          <div className="how-hero-avatar mx-auto mb-4">
            <StepAvatar pose="celebrate" />
          </div>
          <h1 className="fw-bold mb-3 text-white">{t('how_page_title')}</h1>
          <p className="text-white opacity-75 mb-0 mx-auto" style={{ maxWidth: 520 }}>
            {t('how_page_subtitle')}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="container py-5">
        <div className="how-timeline">
          {STEPS.map((step, index) => (
            <div key={index} className="how-step">
              {/* Connector line — hidden on last step */}
              {index < STEPS.length - 1 && (
                <div className="how-connector" style={{ borderColor: step.color }} />
              )}

              {/* Step number bubble */}
              <div className="how-step-number" style={{ background: step.color }}>
                {index + 1}
              </div>

              {/* Card */}
              <div className="how-step-card">
                {/* Avatar + icon badge */}
                <div className="how-avatar-wrap">
                  <StepAvatar pose={step.pose} />
                  <span className="how-step-badge" style={{ background: step.color }}>
                    <i className={`bi ${step.icon}`}></i>
                  </span>
                </div>

                {/* Content */}
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
            <StepAvatar pose="phone" />
          </div>
          <h4 className="fw-bold mb-2">{t('how_cta_title')}</h4>
          <p className="text-muted mb-4">{t('how_cta_desc')}</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg-mobile"
            >
              <i className="bi bi-whatsapp me-2"></i>
              {t('how_cta_btn')}
            </a>
            <Link to="/products" className="btn btn-primary btn-lg-mobile">
              <i className="bi bi-grid me-2"></i>
              {t('how_start_btn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToOrderPage;
