import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ruTranslations from './locales/ru.json';
import enTranslations from './locales/en.json';

i18n
  .use(LanguageDetector) // Автоматически определяет язык браузера
  .use(initReactI18next) // Передает i18n в react-i18next
  .init({
    resources: {
      ru: { translation: ruTranslations },
      en: { translation: enTranslations }
    },
    fallbackLng: 'ru', // Язык по умолчанию, если перевод не найден
    interpolation: {
      escapeValue: false // React сам защищает от XSS
    }
  });

export default i18n;