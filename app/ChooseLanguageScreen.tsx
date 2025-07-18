import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';
import i18n from './i18n'; // Adjust the import path if your file structure is different

const LANGUAGE_KEY = 'user-language';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ny', label: 'Chichewa' },
];

const ChooseLanguageScreen: React.FC = () => {
  const { t } = useTranslation();

  const handleLanguageChange = async (code: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('choose_language')}</Text>
      {LANGUAGES.map((lang) => (
        <View key={lang.code} style={styles.buttonContainer}>
          <Button
            title={lang.label}
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
