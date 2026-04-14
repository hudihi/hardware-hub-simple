import { useTranslatedContent } from '../hooks/useTranslatedContent';

/**
 * Renders dynamic admin-posted text translated to the active language.
 * Use this wherever you need a translated string inside JSX but can't call
 * a hook directly (e.g. inside Array.map).
 *
 * Usage:
 *   <TranslatedText text={category.name} />
 */
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const translated = useTranslatedContent(text);
  return <>{translated || text}</>;
};

export default TranslatedText;
