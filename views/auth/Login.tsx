import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { styles } from "../../styles.ts";
import { signIn } from "../../services/authService.ts";

type Props = {
  navigate: () => void;
  onLogin: () => void;
};

export default function LoginScreen({ navigate, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await signIn(email, password);
    if (error) Alert.alert("Erreur", error.message);
    else onLogin();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez votre email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez votre mot de passe"
        placeholderTextColor="#999"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>

      <Text style={styles.switchText} onPress={navigate}>
        Pas de compte ? Inscrivez-vous
      </Text>
    </View>
  );
}
