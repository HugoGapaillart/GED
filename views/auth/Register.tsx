import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { signUp } from "../../services/authService.ts";
import { styles } from "../../styles.ts";

type Props = {
  navigate: () => void;
  onRegister: () => void;
};

export default function RegisterScreen({ navigate, onRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleRegister() {
    const { error } = await signUp(email, password, name);
    if (error) Alert.alert("Erreur", error.message);
    else {
      Alert.alert("Succès", "Compte créé !");
      onRegister();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.input}
        placeholder="Choisissez un nom"
        onChangeText={setName}
        value={name}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>

      <Text style={styles.switchText} onPress={navigate}>
        Déjà un compte ? Connectez-vous
      </Text>
    </View>
  );
}
