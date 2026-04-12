import { Copy, Share2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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

const ShareButton: React.FC<ShareButtonProps> = ({
  title, text, url, image, price,
  className = '', children, style,
}) => {
  const [isLoading, setIsLoading]     = useState(false);
  const [isFallback, setIsFallback]   = useState(false);
  const [copied, setCopied]           = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const modalRef                       = useRef<HTMLDivElement>(null);
  const { language }                   = useLanguage();

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setIsFallback(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFallback(false); };
    if (isFallback) {
      document.addEventListener('mousedown', onOutside);
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isFallback]);

  const shareText = language === 'sw'
    ? `🔩 ${title}\n💰 ${price ?? ''}\n\n🏪 Inapatikana: Pahala Hardware Store\nTembelea duka au agiza mtandaoni:\n👉 ${url}`
    : `🔩 ${title}\n💰 ${price ?? ''}\n\n🏪 Available at: Pahala Hardware Store\nVisit our store or order online:\n👉 ${url}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      // Fetch the product image as a real File so it appears as an image, not a URL
      let imageFile: File | undefined;
      if (image) {
        try {
          const resp  = await fetch(image);
          const blob  = await resp.blob();
          const ext   = blob.type.includes('png') ? 'png' : 'jpg';
          imageFile   = new File([blob], `product.${ext}`, { type: blob.type || 'image/jpeg' });
        } catch {
          // image fetch failed — proceed without it
        }
      }

      if (navigator.share) {
        // Try with image file first
        if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
          await navigator.share({ files: [imageFile], title, text: shareText });
          return;
        }
        // Fallback: share without file (text + url only)
        await navigator.share({ title, text: shareText, url });
        return;
      }

      // Browser has no native share — show fallback sheet
      setIsFallback(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setIsFallback(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
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

      {/* Fallback sheet — shown only when native share is unavailable */}
      {isFallback && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsFallback(false)}
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            className={`relative bg-white rounded-t-2xl md:rounded-2xl w-full max-w-sm shadow-xl overflow-hidden ${
              isMobile ? 'animate-slide-up' : 'animate-scale-in'
            }`}
            role="dialog"
            aria-modal="true"
          >
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-gray-800">
                {language === 'sw' ? 'Shiriki Bidhaa' : 'Share Product'}
              </h3>
              <button
                onClick={() => setIsFallback(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Product preview */}
              <div className="flex gap-3 items-start bg-gray-50 rounded-xl p-3 border border-gray-100">
                {image && (
                  <img
                    src={image}
                    alt={title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-snug">{title}</p>
                  {price && <p className="text-sm text-orange-600 font-medium mt-0.5">{price}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'sw' ? 'Pahala Hardware Store' : 'Pahala Hardware Store'}
                  </p>
                </div>
              </div>

              {/* Message preview */}
              <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100 whitespace-pre-wrap font-sans leading-relaxed">
                {shareText}
              </pre>

              {/* Copy button */}
              <button
                onClick={copyMessage}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  copied
                    ? 'bg-green-50 border border-green-400 text-green-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <Copy size={15} />
                {copied
                  ? (language === 'sw' ? '✓ Imenakiliwa!' : '✓ Copied!')
                  : (language === 'sw' ? 'Nakili Ujumbe' : 'Copy Message')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
