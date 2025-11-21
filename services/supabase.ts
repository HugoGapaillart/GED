import { Platform, AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage as any } : {}),
    autoRefreshToken: true, // déjà géré par Supabase v2
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Optionnel : tu peux réagir à l'état actif/inactif de l'app
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      console.log('App redevient active — Supabase gère le refresh automatiquement');
    }
  });
}