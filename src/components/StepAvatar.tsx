import React from 'react';

export type AvatarPose =
  | 'browse'
  | 'cart'
  | 'form'
  | 'phone'
  | 'pay'
  | 'upload'
  | 'celebrate'
  | 'confirm'
  | 'screenshot';

interface StepAvatarProps {
  pose: AvatarPose;
  size?: number;
}

const StepAvatar: React.FC<StepAvatarProps> = ({ pose, size = 80 }) => {
  const brown = '#7C5A3C';
  const brownLight = '#A67C52';
  const skin = '#F5EDE4';
  const viewH = 100;
  const viewW = 80;

  const arms: Record<AvatarPose, React.ReactNode> = {
    browse: (
      <>
        <rect x="5" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(25 15 58)" />
        <rect x="55" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-25 65 58)" />
      </>
    ),
    cart: (
      <>
        <rect x="4" y="50" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-5 14 54)" />
        <rect x="56" y="50" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(5 66 54)" />
        <path d="M 18 68 Q 40 76 62 68" stroke={brown} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
    form: (
      <>
        <rect x="5" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(20 15 58)" />
        <rect x="55" y="46" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-65 65 50)" />
        <rect x="66" y="28" width="5" height="18" rx="2" fill={brown} transform="rotate(-20 68 37)" />
        <polygon points="65,44 70,44 67.5,50" fill={brown} transform="rotate(-20 67.5 47)" />
      </>
    ),
    phone: (
      <>
        <rect x="5" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(20 15 58)" />
        <rect x="55" y="44" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-75 65 48)" />
        <rect x="61" y="22" width="14" height="22" rx="3" fill="white" stroke={brown} strokeWidth="1.5" />
        <rect x="64" y="26" width="8" height="13" rx="1" fill="#d4e4f7" />
        <circle cx="68" cy="41" r="1.5" fill={brown} />
      </>
    ),
    pay: (
      <>
        <rect x="3" y="50" width="22" height="9" rx="4.5" fill={brownLight} transform="rotate(-15 14 54)" />
        <rect x="55" y="50" width="22" height="9" rx="4.5" fill={brownLight} transform="rotate(15 66 54)" />
        <rect x="22" y="68" width="36" height="18" rx="3" fill="#4caf50" />
        <rect x="26" y="72" width="28" height="10" rx="2" fill="#43a047" />
        <text x="40" y="80" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">TSh</text>
      </>
    ),
    upload: (
      <>
        <rect x="5" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(20 15 58)" />
        <rect x="55" y="42" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-60 65 46)" />
        <rect x="58" y="22" width="18" height="20" rx="3" fill="white" stroke={brown} strokeWidth="1.5" />
        <polyline points="67,28 67,38" stroke={brown} strokeWidth="2" strokeLinecap="round" />
        <polyline points="63,31 67,27 71,31" stroke={brown} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    celebrate: (
      <>
        <rect x="2" y="46" width="22" height="9" rx="4.5" fill={brownLight} transform="rotate(-55 13 50)" />
        <rect x="56" y="46" width="22" height="9" rx="4.5" fill={brownLight} transform="rotate(55 67 50)" />
        <text x="10" y="20" fontSize="12">⭐</text>
        <text x="58" y="18" fontSize="10">✨</text>
        <text x="34" y="10" fontSize="8">🎉</text>
      </>
    ),
    confirm: (
      <>
        <rect x="5" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(20 15 58)" />
        <rect x="55" y="44" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-75 65 48)" />
        {/* Phone with checkmark */}
        <rect x="61" y="22" width="14" height="22" rx="3" fill="white" stroke={brown} strokeWidth="1.5" />
        <polyline points="64,33 67,37 72,29" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    screenshot: (
      <>
        <rect x="5" y="54" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(20 15 58)" />
        <rect x="55" y="44" width="20" height="9" rx="4.5" fill={brownLight} transform="rotate(-75 65 48)" />
        {/* Phone with camera icon */}
        <rect x="61" y="22" width="14" height="22" rx="3" fill="white" stroke={brown} strokeWidth="1.5" />
        <rect x="64" y="26" width="8" height="12" rx="1" fill="#f0e8e0" />
        <circle cx="68" cy="32" r="3" fill={brown} opacity="0.4" />
        <circle cx="68" cy="32" r="1.5" fill={brown} />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size * (viewH / viewW)}
      viewBox={`0 0 ${viewW} ${viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="24" y="50" width="32" height="42" rx="8" fill={brownLight} />
      {arms[pose]}
      <rect x="34" y="46" width="12" height="10" rx="4" fill={skin} />
      <circle cx="40" cy="30" r="22" fill={brown} />
      <ellipse cx="40" cy="32" rx="14" ry="13" fill={skin} opacity="0.15" />
      <circle cx="32" cy="28" r="3.5" fill="white" />
      <circle cx="48" cy="28" r="3.5" fill="white" />
      <circle cx="33" cy="29" r="1.5" fill={brown} />
      <circle cx="49" cy="29" r="1.5" fill={brown} />
      <path d="M 29 23 Q 33 21 36 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 44 23 Q 47 21 51 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 33 37 Q 40 43 47 37" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export default StepAvatar;
