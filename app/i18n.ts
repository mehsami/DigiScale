import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../en.json';
import ny from '../ny.json';

export const languageResources: Resource = {
  en: { translation: en },
  ny: { translation: ny },
};

const LANGUAGE_KEY = 'user-language';

const initI18n = async () => {
  // Try to get the saved language from AsyncStorage
  const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
  i18next
    .use(initReactI18next)
    .init({
      lng: storedLang || 'en', // use saved or default to 'en'
      fallbackLng: 'en',
      resources: languageResources,
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18next;
