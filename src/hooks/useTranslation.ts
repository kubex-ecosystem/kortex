import { useLanguage } from '@contexts/LanguageContext';

export const useTranslation = () => {
  const { translations } = useLanguage();

  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
      if (acc && typeof acc === 'object' && currentKey in acc) return (acc as any)[currentKey];
      return undefined as any;
    }, translations as any);

    if (result === undefined) return key;

    if (options && typeof result === 'string') {
      Object.keys(options).forEach((k) => {
        const regex = new RegExp(`{${k}}`, 'g');
        result = (result as string).replace(regex, String(options[k]));
      });
    }
    return result as string;
  };

  return { t };
};

