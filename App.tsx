import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider, BottomNavigation } from "react-native-paper";
import { supabase } from "./services/supabase";

import AppNavigator from "./routes/AppNavigator";
import ProfileScreen from "./views/profile/ProfileScreen";

import LoginScreen from "./views/auth/Login";
import RegisterScreen from "./views/auth/Register";

import type { Session } from "@supabase/supabase-js";
import { styles } from "./styles";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const routes = [
    { key: "home", title: "Home", focusedIcon: "file-document-outline" },
    { key: "profile", title: "Profil", focusedIcon: "account" },
  ];

  useEffect(() => {
    // Récupère la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Écoute les changements d'auth
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Pas besoin de cleanup
  }, []);

  if (loading) return null;

  if (!session)
    return <AuthWrapper onLogged={() => setSession({} as Session)} />;

  const renderScene = BottomNavigation.SceneMap({
    home: AppNavigator,
    profile: ProfileScreen,
  });

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.base}>
          <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
            shifting={true}
            barStyle={{ height: "10%" }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

function AuthWrapper({ onLogged }: { onLogged: () => void }) {
  const [screen, setScreen] = useState<"Login" | "Register">("Login");

  return screen === "Login" ? (
    <LoginScreen navigate={() => setScreen("Register")} onLogin={onLogged} />
  ) : (
    <RegisterScreen navigate={() => setScreen("Login")} onRegister={onLogged} />
  );
}
