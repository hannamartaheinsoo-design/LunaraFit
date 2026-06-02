import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from '../types';
import { t as _t, tArr as _tArr, StringKey } from './i18n';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
  tArr: (key: StringKey) => string[];
}

const LangContext = createContext<LangContextValue>({
  lang: 'et',
  setLang: () => {},
  t: (key) => key,
  tArr: () => [],
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('et');

  useEffect(() => {
    AsyncStorage.getItem('lf_profile').then((raw) => {
      if (raw) {
        const p = JSON.parse(raw);
        if (p.lang === 'en' || p.lang === 'et') setLangState(p.lang);
      }
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.getItem('lf_profile').then((raw) => {
      const p = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem('lf_profile', JSON.stringify({ ...p, lang: l }));
    });
  };

  const value: LangContextValue = {
    lang,
    setLang,
    t: (key) => _t(key, lang),
    tArr: (key) => _tArr(key, lang),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useTranslation() {
  return useContext(LangContext);
}
