import { useI18n } from '../i18n';

export function LanguageSwitcher() {
  const { toggleLocale, isRTL } = useI18n();

  return (
    <button
      className="px-3 py-1.5 rounded-lg bg-surface/60 border border-border-subtle text-sm text-text-primary hover:bg-surface/80 transition-colors flex items-center gap-1.5"
      onClick={toggleLocale}
      title={isRTL ? 'Switch to English' : 'تغییر به فارسی'}
    >
      <span>{isRTL ? '🇬🇧' : '🇮🇷'}</span>
      <span>{isRTL ? 'EN' : 'FA'}</span>
    </button>
  );
}
