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

// ─── Canvas helpers ────────────────────────────────────────────────────────────

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

/** Draws wrapped text and returns the Y position after the last line */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let curY  = y;
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

/**
 * Builds a share card image:
 * product photo (top) · title · price · store message
 * The URL is NOT embedded — it is passed separately to navigator.share
 * so messaging apps render it as a real clickable link.
 */
async function buildShareCard(
  imageUrl: string,
  title: string,
  price: string | undefined,
  lang: string
): Promise<Blob | null> {
  try {
    // Load product image with crossOrigin so canvas stays untainted on mobile.
    // First try fetch (works when CDN sends CORS headers); if that fails fall
    // back to a direct img load — canvas will be tainted but toBlob still works
    // in most mobile browsers for same-session images.
    const productImg = new Image();
    productImg.crossOrigin = 'anonymous';

    const loaded = await new Promise<boolean>((resolve) => {
      productImg.onload  = () => resolve(true);
      productImg.onerror = () => {
        // Retry without crossOrigin (allows canvas taint, but toBlob still works)
        const fallback = new Image();
        fallback.onload  = () => { Object.assign(productImg, fallback); resolve(true); };
        fallback.onerror = () => resolve(false);
        fallback.src = imageUrl;
      };
      productImg.src = imageUrl;
    });

    if (!loaded || productImg.naturalWidth === 0) return null;

    // Load store logo (fail silently — card still works without it)
    const logoImg = new Image();
    await new Promise<void>((res) => {
      logoImg.onload  = () => res();
      logoImg.onerror = () => res();
      logoImg.src = '/PAHELA_27_FEBRUARY_2025.svg';
    });

    // ── Measure title to compute exact canvas height ────────────────────
    const W   = 1080;
    const PAD = 52;
    const measureCanvas = document.createElement('canvas');
    const mCtx = measureCanvas.getContext('2d')!;
    mCtx.font = 'bold 56px Arial, sans-serif';
    const maxTextW = W - PAD * 2;
    let titleLines = 1, line = '';
    for (const word of title.split(' ')) {
      const test = line + word + ' ';
      if (mCtx.measureText(test).width > maxTextW && line !== '') {
        titleLines++;
        line = word + ' ';
      } else { line = test; }
    }
    titleLines = Math.min(titleLines, 3);

    // ── Layout ──────────────────────────────────────────────────────────
    const IMG_SIZE = W - PAD * 2;                 // square photo
    const IMG_Y    = PAD;
    const INFO_Y   = IMG_Y + IMG_SIZE + 44;       // gap below photo

    const TITLE_BLOCK  = titleLines * 68;
    const PRICE_BLOCK  = price ? 68 : 0;
    const DIVIDER_H    = 36;
    const STORE_BLOCK  = 56;
    const VISIT_BLOCK  = 50;
    const BOTTOM_PAD   = 56;

    const H = INFO_Y + TITLE_BLOCK + PRICE_BLOCK + DIVIDER_H + STORE_BLOCK + VISIT_BLOCK + BOTTOM_PAD;

    const canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // ── Background ──────────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // ── Product photo (cover-fit square, rounded) ────────────────────────
    ctx.save();
    roundedRect(ctx, PAD, IMG_Y, IMG_SIZE, IMG_SIZE, 28);
    ctx.clip();
    const nw = productImg.naturalWidth, nh = productImg.naturalHeight;
    let sx = 0, sy = 0, sw = nw, sh = nh;
    if (nw / nh > 1) { sw = nh; sx = (nw - sw) / 2; }
    else             { sh = nw; sy = (nh - sh) / 2;  }
    ctx.drawImage(productImg, sx, sy, sw, sh, PAD, IMG_Y, IMG_SIZE, IMG_SIZE);
    ctx.restore();

    // Brand-color border around photo
    ctx.save();
    roundedRect(ctx, PAD, IMG_Y, IMG_SIZE, IMG_SIZE, 28);
    ctx.strokeStyle = '#7C5A3C';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // ── Store logo — bottom-right corner of photo ─────────────────────────
    if (logoImg.naturalWidth > 0) {
      const LOGO_SIZE = 148;
      const INSET     = 20;
      const LOGO_X    = PAD + IMG_SIZE - LOGO_SIZE - INSET;
      const LOGO_Y    = IMG_Y + IMG_SIZE - LOGO_SIZE - INSET;
      const CX        = LOGO_X + LOGO_SIZE / 2;
      const CY        = LOGO_Y + LOGO_SIZE / 2;
      const R         = LOGO_SIZE / 2 + 6;

      // Soft white circle backdrop — just enough to lift the logo off the photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.fill();
      ctx.restore();

      // Logo itself (clipped to the circle so no square edge shows)
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE);
      ctx.restore();
    }

    // ── Product title ────────────────────────────────────────────────────
    ctx.fillStyle    = '#111827';
    ctx.font         = 'bold 56px Arial, sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    let nextY = drawWrappedText(ctx, title, PAD, INFO_Y, maxTextW, 68);

    // ── Price ─────────────────────────────────────────────────────────────
    if (price) {
      ctx.fillStyle = '#ea580c';
      ctx.font      = 'bold 50px Arial, sans-serif';
      ctx.fillText(price, PAD, nextY + 6);
      nextY += 68;
    }

    // ── Divider ───────────────────────────────────────────────────────────
    nextY += 18;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(PAD, nextY, W - PAD * 2, 2);
    nextY += 18;

    // ── Store message ──────────────────────────────────────────────────────
    const storeMsg = lang === 'sw'
      ? '🏪  Inapatikana: Pahala Hardware Store'
      : '🏪  Available at: Pahala Hardware Store';
    ctx.fillStyle = '#6b7280';
    ctx.font      = '38px Arial, sans-serif';
    ctx.fillText(storeMsg, PAD, nextY);
    nextY += 50;

    // ── Visit line ─────────────────────────────────────────────────────────
    const visitMsg = lang === 'sw'
      ? '🔗  Tembelea: www.pahala.store kwa bidhaa zaidi'
      : '🔗  Visit: www.pahala.store for more products';
    ctx.fillStyle = '#2563eb';
    ctx.font      = '36px Arial, sans-serif';
    ctx.fillText(visitMsg, PAD, nextY);

    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.93);
    });
  } catch (err) {
    console.error('buildShareCard failed:', err);
    return null;
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ShareButton: React.FC<ShareButtonProps> = ({
  title, text, url, image, price,
  className = '', children, style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { language, t } = useLanguage();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      let fileToShare: File | undefined;

      if (image) {
        // Build card: photo + title + price + store message baked into one image
        const blob = await buildShareCard(image, title, price, language);
        if (blob) {
          fileToShare = new File([blob], `${title.replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });
        }
      }

      if (!navigator.share) {
        // No native share API — fall back to copying the URL
        await navigator.clipboard?.writeText(url).catch(() => {});
        alert(t('share_link_copied'));
        return;
      }

      if (fileToShare && navigator.canShare?.({ files: [fileToShare] })) {
        // Share the card image + the URL as text.
        // The image carries all visual details; the URL appears as a
        // real clickable link in WhatsApp / Telegram / etc.
        await navigator.share({ files: [fileToShare], title });
      } else {
        // Fallback: native share without image file (text + link)
        await navigator.share({ title, text, url });
      }
    } catch (err: unknown) {
      // AbortError = user cancelled — do nothing
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
      aria-label={t('share_label')}
    >
      {isLoading
        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        : (children || <><Share2 size={16} />{t('share_label')}</>)
      }
    </button>
  );
};

export default ShareButton;
