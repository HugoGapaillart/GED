import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { styles } from "../../styles.ts";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../services/supabase.ts";
import { createDocument, uploadFile } from "../../services/documentService.ts";

export default function AddDocumentScreen({ navigate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [keywords, setKeywords] = useState("");
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string>("application/octet-stream");

  function capitalize(str: string) {
    return str
      ? str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase()
      : "";
  }

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

      if (!result.canceled) {
        const file = result.assets[0];
        setFileUri(file.uri);
        setFileName(file.name);
        setFileMime(file.mimeType ?? "application/octet-stream");
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission caméra refusée");

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    });
    if (result.canceled) return;

    const photo = result.assets[0];
    setFileUri(photo.uri);
    setFileName(`photo_${Date.now()}.jpg`);
    setFileMime("image/jpeg");
  }

  async function pickImageFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission refusée", "Autorisez la galerie.");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) return;

    const photo = result.assets[0];
    setFileUri(photo.uri);
    setFileName(photo.fileName ?? `image_${Date.now()}.jpg`);
    setFileMime("image/jpeg");
  }

  async function handleAdd() {
    try {
      if (!fileUri || !fileName)
        throw new Error("Veuillez sélectionner un fichier");

      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) throw new Error("Utilisateur non connecté");

      const userId = data.user.id;

      const filePath = await uploadFile(fileUri, fileName, fileMime);

      await createDocument({
        title,
        description,
        categories: categories.split(",").map(capitalize),
        keywords: keywords.split(",").map(capitalize),
        file_url: filePath,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      Alert.alert("Succès", "Document ajouté !");
      navigate("List");
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity
        onPress={() => navigate("List")}
        style={{ marginBottom: 16 }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ajouter un document</Text>

      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Catégories (séparées par virgules)</Text>
      <TextInput
        style={styles.input}
        value={categories}
        onChangeText={setCategories}
      />

      <Text style={styles.label}>Mots-clés (séparés par virgules)</Text>
      <TextInput
        style={styles.input}
        value={keywords}
        onChangeText={setKeywords}
      />

      {!fileUri && (
        <>
          <Text style={[styles.label, { marginBottom: 12 }]}>
            Sélectionner un fichier :
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.buttonText}>Galerie</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={pickFile}>
              <Text style={styles.buttonText}>Fichier</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {fileUri && fileMime.startsWith("image/") && (
        <Image
          source={{ uri: fileUri }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            marginVertical: 16,
          }}
        />
      )}

      {fileUri && !fileMime.startsWith("image/") && (
        <View
          style={{
            padding: 12,
            backgroundColor: "#eee",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text>{fileName}</Text>
        </View>
      )}

      {fileUri && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red" }]}
          onPress={() => {
            setFileUri(null);
            setFileName(null);
            setFileMime("application/octet-stream");
          }}
        >
          <Text style={styles.buttonText}>Retirer le fichier</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Ajouter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
