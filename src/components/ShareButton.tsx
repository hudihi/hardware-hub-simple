import { Share2 } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  image?: string;
  price?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

// ── Brand palette ─────────────────────────────────────────────────────────────
const BRAND = {
  brown:      '#7C5A3C',
  brownDark:  '#5C3D2E',
  brownLight: '#A67C52',
  cream:      '#FDF8F3',
  beige:      '#F5EDE4',
  gray:       '#6C757D',
} as const;

// ── Canvas helpers ────────────────────────────────────────────────────────────

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) { ctx.fillText(line.trim(), x, curY); curY += lineHeight; }
  return curY;
}

// ── Share card generator ──────────────────────────────────────────────────────

async function buildShareCard(
  imageUrl: string,
  title: string,
  price: string | undefined,
  lang: string
): Promise<Blob | null> {
  try {
    // Fetch image as blob — avoids CORS taint on canvas
    const imgResp   = await fetch(imageUrl);
    const imgBlob   = await imgResp.blob();
    const imgObjUrl = URL.createObjectURL(imgBlob);

    const productImg = new Image();
    productImg.src   = imgObjUrl;
    await new Promise<void>((res, rej) => {
      productImg.onload  = () => res();
      productImg.onerror = () => rej(new Error('Image load failed'));
    });

    // ── Dimensions ───────────────────────────────────────────────────────
    const W       = 1080;
    const PAD_X   = 52;
    const TOP_BAR = 10;
    const BOT_BAR = 10;

    // Text column starts after the left accent bar
    const ACCENT_W = 6;
    const ACCENT_GAP = 20;
    const TEXT_X   = PAD_X + ACCENT_W + ACCENT_GAP;
    const TEXT_MAX = W - TEXT_X - PAD_X;

    // Measure title line count
    const mc = document.createElement('canvas').getContext('2d')!;
    mc.font = 'bold 54px Arial, sans-serif';
    let titleLines = 1;
    let tLine = '';
    for (const word of title.split(' ')) {
      const test = tLine + word + ' ';
      if (mc.measureText(test).width > TEXT_MAX && tLine !== '') {
        titleLines++;
        tLine = word + ' ';
      } else {
        tLine = test;
      }
    }
    titleLines = Math.min(titleLines, 2);

    const IMG_Y    = TOP_BAR + 44;
    const IMG_SIZE = W - PAD_X * 2;           // 976 × 976 square
    const INFO_Y   = IMG_Y + IMG_SIZE + 44;

    const TITLE_H   = titleLines * 66;
    const PRICE_H   = price ? 66 : 0;
    const DIVIDER_H = 52;                      // gap + rule + gap
    const STORE_H   = 54;
    const VISIT_H   = 52;
    const STAMP_H   = 52;
    const BOT_PAD   = 36;

    const H = INFO_Y + TITLE_H + PRICE_H + DIVIDER_H + STORE_H + VISIT_H + STAMP_H + BOT_PAD + BOT_BAR;

    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // ── 1. Cream background ───────────────────────────────────────────────
    ctx.fillStyle = BRAND.cream;
    ctx.fillRect(0, 0, W, H);

    // ── 2. Subtle diagonal texture (gives it a premium paper feel) ────────
    ctx.save();
    ctx.strokeStyle = 'rgba(124, 90, 60, 0.055)';
    ctx.lineWidth = 1.5;
    for (let i = -H; i < W + H; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
    ctx.restore();

    // ── 3. Top + bottom brand bars ────────────────────────────────────────
    ctx.fillStyle = BRAND.brown;
    ctx.fillRect(0, 0, W, TOP_BAR);
    ctx.fillStyle = BRAND.brown;
    ctx.fillRect(0, H - BOT_BAR, W, BOT_BAR);

    // Thin accent line below top bar
    ctx.fillStyle = BRAND.brownLight;
    ctx.fillRect(0, TOP_BAR, W, 3);

    // ── 4. Image shadow ───────────────────────────────────────────────────
    ctx.save();
    ctx.shadowColor   = 'rgba(92, 61, 46, 0.22)';
    ctx.shadowBlur    = 32;
    ctx.shadowOffsetY = 10;
    roundedRect(ctx, PAD_X, IMG_Y, IMG_SIZE, IMG_SIZE, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // ── 5. Product image (cover-fit, rounded) ─────────────────────────────
    ctx.save();
    roundedRect(ctx, PAD_X, IMG_Y, IMG_SIZE, IMG_SIZE, 20);
    ctx.clip();
    const nw = productImg.naturalWidth, nh = productImg.naturalHeight;
    let sx = 0, sy = 0, sw = nw, sh = nh;
    if (nw / nh > 1) { sw = nh; sx = (nw - sw) / 2; }
    else             { sh = nw; sy = (nh - sh) / 2;  }
    ctx.drawImage(productImg, sx, sy, sw, sh, PAD_X, IMG_Y, IMG_SIZE, IMG_SIZE);
    ctx.restore();
    URL.revokeObjectURL(imgObjUrl);

    // ── 6. Brown border on image ──────────────────────────────────────────
    ctx.save();
    roundedRect(ctx, PAD_X, IMG_Y, IMG_SIZE, IMG_SIZE, 20);
    ctx.strokeStyle = BRAND.brown;
    ctx.lineWidth   = 5;
    ctx.stroke();
    ctx.restore();

    // ── 7. Brand seal — "P" monogram, bottom-right of photo ──────────────
    const SEAL_R  = 46;
    const SEAL_CX = PAD_X + IMG_SIZE - SEAL_R - 18;
    const SEAL_CY = IMG_Y  + IMG_SIZE - SEAL_R - 18;

    // Outer ring
    ctx.save();
    ctx.strokeStyle = BRAND.cream;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(SEAL_CX, SEAL_CY, SEAL_R + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Filled circle
    ctx.fillStyle = 'rgba(92, 61, 46, 0.92)';
    ctx.beginPath();
    ctx.arc(SEAL_CX, SEAL_CY, SEAL_R, 0, Math.PI * 2);
    ctx.fill();

    // "P" letter
    ctx.fillStyle    = BRAND.cream;
    ctx.font         = 'bold 46px Arial, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', SEAL_CX, SEAL_CY + 1);

    // ── 8. Info section ───────────────────────────────────────────────────
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';

    let nextY = INFO_Y;

    // Product title
    ctx.fillStyle = BRAND.brownDark;
    ctx.font      = 'bold 54px Arial, sans-serif';
    nextY = drawWrappedText(ctx, title, TEXT_X, nextY, TEXT_MAX, 66);
    nextY += 4;

    // Price
    if (price) {
      ctx.fillStyle = BRAND.brown;
      ctx.font      = 'bold 50px Arial, sans-serif';
      ctx.fillText(price, TEXT_X, nextY);
      nextY += 66;
    }

    // Divider rule
    nextY += 18;
    ctx.fillStyle = BRAND.beige;
    ctx.fillRect(PAD_X, nextY, W - PAD_X * 2, 2);
    nextY += 20;

    // Small decorative diamond before store line
    const DX = TEXT_X - 10;
    ctx.fillStyle = BRAND.brownLight;
    ctx.save();
    ctx.translate(DX - 12, nextY + 19);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();

    // Store message
    const storeMsg = lang === 'sw'
      ? '  Inapatikana: Pahala Hardware Store'
      : '  Available at: Pahala Hardware Store';
    ctx.fillStyle = BRAND.gray;
    ctx.font      = '38px Arial, sans-serif';
    ctx.fillText(storeMsg, TEXT_X, nextY);
    nextY += 54;

    // Visit line
    const visitMsg = lang === 'sw'
      ? '  Tembelea: www.pahala.store kwa bidhaa zaidi'
      : '  Visit: www.pahala.store for more products';
    ctx.fillStyle = BRAND.brown;
    ctx.font      = '36px Arial, sans-serif';
    ctx.fillText(visitMsg, TEXT_X, nextY);
    nextY += 52;

    // ── 9. Left accent bar (drawn last, full height of info block) ────────
    const barHeight = nextY - INFO_Y;
    ctx.fillStyle = BRAND.brown;
    ctx.fillRect(PAD_X, INFO_Y, ACCENT_W, barHeight);

    // ── 10. Bottom-right hallmark stamp ────────────────────────────────────
    ctx.fillStyle    = BRAND.brownLight;
    ctx.font         = 'bold 24px Arial, sans-serif';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('PAHALA  ·  HARDWARE', W - PAD_X, nextY + 10);

    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.93);
    });
  } catch (err) {
    console.error('buildShareCard failed:', err);
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const ShareButton: React.FC<ShareButtonProps> = ({
  title, text, url, image, price,
  className = '', children, style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      let fileToShare: File | undefined;

      if (image) {
        const blob = await buildShareCard(image, title, price, language);
        if (blob) {
          fileToShare = new File(
            [blob],
            `${title.replace(/\s+/g, '-')}.jpg`,
            { type: 'image/jpeg' }
          );
        }
      }

      if (!navigator.share) {
        await navigator.clipboard?.writeText(url).catch(() => {});
        alert(language === 'sw' ? 'Kiungo kimenakiliwa!' : 'Link copied to clipboard!');
        return;
      }

      if (fileToShare && navigator.canShare?.({ files: [fileToShare] })) {
        await navigator.share({ files: [fileToShare], title });
      } else {
        await navigator.share({ title, text, url });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${className}`}
      style={style}
      aria-label={language === 'sw' ? 'Shiriki' : 'Share'}
    >
      {isLoading
        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        : (children || <><Share2 size={16} />{language === 'sw' ? 'Shiriki' : 'Share'}</>)
      }
    </button>
  );
};

export default ShareButton;
