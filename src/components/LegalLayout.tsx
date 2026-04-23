import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, effectiveDate, children }) => {
  const navigate = useNavigate();

  return (
    <div className="page-container min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="font-semibold text-[#5C3D2E] truncate">{title}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#5C3D2E] mb-1">{title}</h1>
          <p className="text-sm text-gray-500">{effectiveDate}</p>
        </div>

        <div className="legal-content space-y-8 text-gray-700 text-sm leading-relaxed">
          {children}
        </div>
      </main>

      <style>{`
        .legal-content h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #5C3D2E;
          margin-bottom: 0.75rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .legal-content h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .legal-content p {
          margin-bottom: 0.75rem;
          color: #374151;
        }
        .legal-content ul, .legal-content ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .legal-content ul { list-style-type: disc; }
        .legal-content ol { list-style-type: decimal; }
        .legal-content li {
          margin-bottom: 0.375rem;
          color: #374151;
        }
        .legal-content a {
          color: #7C5A3C;
          text-decoration: underline;
        }
        .legal-content strong {
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default LegalLayout;
