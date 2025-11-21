import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { supabase } from "../../services/supabase";
import { styles } from "../../styles";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [docCount, setDocCount] = useState(0);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return;

    setUser(userData.user);

    const { count, error: countError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id);

    if (!countError && count !== null) setDocCount(count);
  }

  async function updateEmail() {
    if (!newEmail.trim()) return Alert.alert("Erreur", "Email invalide");

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return Alert.alert("Erreur", error.message);

    Alert.alert("Succès", "Email mis à jour !");
    setShowEmailModal(false);
    loadProfile();
  }

  async function updatePassword() {
    if (newPassword.length < 6)
      return Alert.alert("Erreur", "Mot de passe trop court.");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) return Alert.alert("Erreur", error.message);

    Alert.alert("Succès", "Mot de passe mis à jour !");
    setShowPasswordModal(false);
    setNewPassword("");
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  if (!user)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chargement...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.profilTitle}>Mon Profil</Text>

      <View style={styles.zone}>
        <Text style={{ fontSize: 18 }}>Nom d'utilisateur :</Text>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          {user?.user_metadata?.display_name}
        </Text>
      </View>

      <View style={[styles.zone, { marginBottom: 20 }]}>
        <Text style={{ fontSize: 18 }}>Documents publiés :</Text>
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>{docCount}</Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowEmailModal(true)}
        style={styles.button}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Modifier mon email
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowPasswordModal(true)}
        style={styles.button}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Modifier mon mot de passe
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={logout}
        style={[styles.button, styles.deleteButton]}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Se déconnecter
        </Text>
      </TouchableOpacity>

      <Modal visible={showEmailModal} transparent animationType="slide">
        <View style={styles.popupBackground}>
          <View style={styles.popupContainer}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              Nouveau email :
            </Text>

            <TextInput
              style={styles.popupInput}
              placeholder="email@example.com"
              value={newEmail}
              onChangeText={setNewEmail}
            />

            <TouchableOpacity
              onPress={updateEmail}
              style={[styles.button, { marginBottom: 10 }]}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Mettre à jour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEmailModal(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center", color: "red" }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.popupBackground}>
          <View style={styles.popupContainer}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              Nouveau mot de passe :
            </Text>

            <TextInput
              secureTextEntry
              style={styles.popupInput}
              placeholder="******"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TouchableOpacity
              onPress={updatePassword}
              style={[styles.button, { marginBottom: 10 }]}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Mettre à jour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center", color: "red" }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
