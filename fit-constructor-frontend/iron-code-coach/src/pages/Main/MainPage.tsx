import { useTranslation } from 'react-i18next';
import styles from './MainPage.module.scss';

interface MainPageProps {
  onStart: () => void;
}

export const MainPage = ({ onStart }: MainPageProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.heroContainer}>
      <h1 className={styles.title}>
        {t('home.titleMain')} <span>{t('home.titleHighlight')}</span>
      </h1>
      <p className={styles.subtitle}>
        {t('home.subtitle')}
      </p>
      <button className={styles.ctaBtn} onClick={onStart}>
        {t('home.startButton')}
      </button>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <h3>⚡ {t('home.card1Title')}</h3>
          <p>{t('home.card1Text')}</p>
        </div>
        <div className={styles.featureCard}>
          <h3>📈 {t('home.card2Title')}</h3>
          <p>{t('home.card2Text')}</p>
        </div>
        <div className={styles.featureCard}>
          <h3>💾 {t('home.card3Title')}</h3>
          <p>{t('home.card3Text')}</p>
        </div>
      </div>
    </div>
  );
};