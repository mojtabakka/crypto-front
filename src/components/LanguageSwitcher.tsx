import { useI18n } from '../i18n';
import { Button } from './Button';
import './LanguageSwitcher.css';

export function LanguageSwitcher() {
  const { toggleLocale, isRTL } =
    useI18n();

  return (
    <Button
      className="header-control language-switcher"
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      title={
        isRTL
          ? 'Switch to English'
          : 'تغییر به فارسی'
      }
      icon={<span className="lang-icon">{isRTL ? '🇬🇧' : '🇮🇷'}</span>}
    >
      {isRTL ? 'EN' : 'FA'}
    </Button>
  );
}
