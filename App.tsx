import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Tab, TabView } from "@rneui/themed";
import { supabase } from "./services/supabase.ts";
import ProfileScreen from "./views/profile/ProfileScreen.tsx";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "./views/auth/Login.tsx";
import RegisterScreen from "./views/auth/Register.tsx";
import AppNavigator from "./routes/AppNavigator.tsx";

export default function App() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) return <AuthWrapper onLogged={() => setSession(true)} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000ff" }}>
        <TabView
          value={index}
          onChange={setIndex}
          animationType="spring"
          disableSwipe
        >
          <TabView.Item style={{ flex: 1, backgroundColor: "#ffffffff" }}>
            <AppNavigator />
          </TabView.Item>

          <TabView.Item style={{ flex: 1, backgroundColor: "#ffffffff" }}>
            <ProfileScreen />
          </TabView.Item>
        </TabView>

        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{
            backgroundColor: "white",
            height: 3,
          }}
          variant="primary"
        >
          <Tab.Item
            title="Document"
            titleStyle={{ fontSize: 12 }}
            icon={<Ionicons name="document-outline" size={20} color="white" />}
          />
          <Tab.Item
            title="Profile"
            titleStyle={{ fontSize: 12 }}
            icon={<Ionicons name="person-outline" size={20} color="white" />}
          />
        </Tab>
      </SafeAreaView>
    </SafeAreaProvider>
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
