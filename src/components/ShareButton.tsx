import { Copy, Facebook, Mail, MessageCircle, Send, Share2, Twitter, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url, 
  className = '',
  children,
  style 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  // Check for device type only (disabled native share to avoid lovable icons)
  useEffect(() => {
    setIsNativeShareSupported(!!navigator.share);
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleShare = async () => {
    if (isNativeShareSupported) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.log('Share failed or was cancelled:', error);
        // Fallback to modal if native share fails
        setIsModalOpen(true);
      }
    } else {
    setIsModalOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedText('copied');
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText('copied');
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  const shareOptions = [
    {
      name: language === 'sw' ? 'Nakili Kiungo' : 'Copy Link',
      icon: Copy,
      action: copyToClipboard,
      color: 'text-gray-600',
      hoverColor: 'hover:bg-gray-100',
      feedback: copiedText
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        const message = encodeURIComponent(`${text}\n\n${url}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
      },
      color: 'text-green-600',
      hoverColor: 'hover:bg-green-50'
    },
    {
      name: 'Telegram',
      icon: Send,
      action: () => {
        const message = encodeURIComponent(`${text}\n\n${url}`);
        window.open(`https://t.me/share/url?text=${message}&url=${encodeURIComponent(url)}`, '_blank');
      },
      color: 'text-blue-600',
      hoverColor: 'hover:bg-blue-50'
    },
    {
      name: language === 'sw' ? 'Barua Pepe' : 'Email',
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${text}\n\n${url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      },
      color: 'text-gray-600',
      hoverColor: 'hover:bg-gray-100'
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      action: () => {
        const tweetText = encodeURIComponent(`${text} ${url}`);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
      },
      color: 'text-sky-600',
      hoverColor: 'hover:bg-sky-50'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      },
      color: 'text-blue-700',
      hoverColor: 'hover:bg-blue-50'
    }
  ];

  return (
    <>
      <button
        onClick={handleShare}
        className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${className}`}
        style={style}
        aria-label={language === 'sw' ? 'Shiriki' : 'Share'}
      >
        {children || <><Share2 size={16} /> {language === 'sw' ? 'Shiriki' : 'Share'}</>}
      </button>

      {/* Share Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <div
            ref={modalRef}
            className={`relative bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-xl transform transition-all ${
              isMobile ? 'animate-slide-up' : 'animate-scale-in'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            {/* Handle for mobile swipe */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 id="share-modal-title" className="text-lg font-semibold">
                {language === 'sw' ? 'Shiriki' : 'Share'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={language === 'sw' ? 'Funga' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Share Options */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${option.hoverColor} ${
                      option.feedback ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                    }`}
                    aria-label={option.name}
                  >
                    <option.icon 
                      size={24} 
                      className={option.color}
                    />
                    <span className="mt-2 text-sm font-medium text-gray-700">
                      {option.feedback === 'copied' 
                        ? (language === 'sw' ? 'Imenakiliwa!' : 'Copied!')
                        : option.name
                      }
                    </span>
                    {option.feedback === 'copied' && (
                      <span className="text-xs text-green-600 mt-1">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* URL Preview */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">
                  {language === 'sw' ? 'Kiungo cha kushiriki:' : 'Share link:'}
                </p>
                <p className="text-xs text-gray-700 break-all font-mono">
                  {url}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
