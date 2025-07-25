import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';
import i18n from './i18n';

const LANGUAGE_KEY = 'user-language';

const LANGUAGES = [
  { code: 'en', labelKey: 'chooseLanguage.english' },
  { code: 'ny', labelKey: 'chooseLanguage.chichewa' },
];

const ChooseLanguageScreen: React.FC = () => {
  const { t } = useTranslation();

  const handleLanguageChange = async (code: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('chooseLanguage.title')}</Text>
      {LANGUAGES.map((lang) => (
        <View key={lang.code} style={styles.buttonContainer}>
          <Button
            title={t(lang.labelKey)}
            onPress={() => handleLanguageChange(lang.code)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 24 },
  buttonContainer: { marginVertical: 8, width: 200 }
});

export default ChooseLanguageScreen;
