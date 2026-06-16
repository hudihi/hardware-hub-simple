import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const MESSAGES_EN = [
  '🚚  Free delivery within Dar es Salaam',
  '📦  New hardware stock every week',
  '💬  WhatsApp order support — always available',
  '🔧  Quality tools, guaranteed',
  '🛡️  Official warranty on all products',
];

const MESSAGES_SW = [
  '🚚  Utoaji bure ndani ya Dar es Salaam',
  '📦  Bidhaa mpya za ujenzi kila wiki',
  '💬  Msaada wa WhatsApp — wakati wowote',
  '🔧  Vifaa bora, vilivyothibitishwa',
  '🛡️  Dhamana rasmi kwa bidhaa zote',
];

const AnnouncementBanner: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  const messages = language === 'sw' ? MESSAGES_SW : MESSAGES_EN;
  // Duplicate for seamless infinite scroll
  const track = [...messages, ...messages];

  return (
    <div className="announcement-banner" role="marquee" aria-label="Announcements">
      <div className="announcement-track">
        {track.map((msg, i) => (
          <span key={i} className="announcement-item">
            {msg}
            <span className="announcement-dot" aria-hidden="true">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
