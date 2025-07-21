import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next, { ModuleType, Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../en.json';
import ny from '../ny.json';

export const languageResources: Resource = {
  en: { translation: en },
  ny: { translation: ny },
};

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
  type: 'languageDetector' as ModuleType,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    callback(lang || 'en');
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  },
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: languageResources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;
