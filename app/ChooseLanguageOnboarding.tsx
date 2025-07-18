import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from './i18n';

const LANGUAGE_KEY = 'user-language';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ny', label: 'Chichewa' },
];

type Props = {
  navigation?: any;
  onProceed?: () => void;
};

const ChooseLanguageOnboarding: React.FC<Props> = ({ navigation, onProceed }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleLanguageChange = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    i18n.changeLanguage(code);
  };

  const handleProceed = () => {
    if (navigation) {
      navigation.replace('Home');
    } else if (onProceed) {
      onProceed();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('choose_language')}</Text>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.langBtn,
            selected === lang.code && styles.langBtnSelected,
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text
            style={[
              styles.langBtnText,
              selected === lang.code && styles.langBtnTextSelected,
            ]}
          >
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 32 }} />
      <Button
        title={t('proceed') || 'Proceed'}
        onPress={handleProceed}
        disabled={!selected}
        color="#2563eb"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f8fbfc" },
  title: { fontSize: 24, marginBottom: 32, color: "#2563eb", fontWeight: "bold" },
  langBtn: {
    backgroundColor: "#eaf1fd",
    paddingVertical: 16,
    borderRadius: 8,
    marginVertical: 8,
    width: 220,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eaf1fd",
  },
  langBtnSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  langBtnText: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "600",
  },
  langBtnTextSelected: {
    color: "#fff",
  },
  buttonContainer: { marginVertical: 8, width: 200 },
});

export default ChooseLanguageOnboarding;