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
import {
  updateDocument,
  uploadFile,
  deleteFile,
} from "../../services/documentService.ts";

export default function EditDocumentScreen({ params, navigate }: any) {
  const document = params?.document;

  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState(document.description);
  const [categories, setCategories] = useState(document.categories.join(", "));
  const [keywords, setKeywords] = useState(document.keywords.join(", "));

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string>(
    document.file_url.endsWith(".jpg") ||
      document.file_url.endsWith(".jpeg") ||
      document.file_url.endsWith(".png")
      ? "image/jpeg"
      : "application/octet-stream"
  );

  function capitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
        setFileMime(result.assets[0].mimeType ?? "application/octet-stream");
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
      quality: 0.8,
    });
    if (result.canceled) return;

    const photo = result.assets[0];
    setFileUri(photo.uri);
    setFileName(`photo_${Date.now()}.jpg`);
    setFileMime("image/jpeg");
  }

  async function pickImageFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Permission refusée",
        "Autorisez l'accès à la galerie."
      );
    }

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

  async function handleUpdate() {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user)
        throw new Error("Utilisateur non connecté");
      const userId = userData.user.id;

      let newPath = document.file_url;

      // Si nouveau fichier → upload + suppression ancien fichier
      if (fileUri && fileName) {
        newPath = await uploadFile(fileUri, fileName, fileMime);

        if (document.file_url) {
          try {
            await deleteFile(document.file_url);
          } catch (e) {
            console.warn(
              "Impossible de supprimer l'ancien fichier :",
              e.message
            );
          }
        }
      }

      const { data: updatedDoc, error } = await updateDocument(
        document.id,
        {
          title,
          description,
          categories: categories.split(",").map((c) => capitalize(c.trim())),
          keywords: keywords.split(",").map((k) => capitalize(k.trim())),
          file_url: newPath,
        },
        userId
      );

      if (error) throw error;

      Alert.alert("Succès", "Document mis à jour !");
      navigate("Detail", { document: updatedDoc[0] });
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  }

  async function handleDelete() {
    try {
      if (document.file_url) {
        try {
          await deleteFile(document.file_url);
        } catch (e: any) {
          console.warn(
            "Impossible de supprimer le fichier associé :",
            e.message
          );
        }
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id)
        .eq("user_id", document.user_id);

      if (error) throw error;

      Alert.alert("Supprimé", "Document et fichier associés supprimés !");
      navigate("List");
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity
        onPress={() => navigate("Detail", { document })}
        style={{ marginBottom: 16 }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Modifier le document</Text>

      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Catégories</Text>
      <TextInput
        style={styles.input}
        value={categories}
        onChangeText={setCategories}
      />

      <Text style={styles.label}>Mots-clés</Text>
      <TextInput
        style={styles.input}
        value={keywords}
        onChangeText={setKeywords}
      />

      {!fileUri && (
        <>
          <Text style={[styles.label, { marginBottom: 12 }]}>
            Modifier le fichier :
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
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

          <View
            style={{
              marginVertical: 16,
              backgroundColor: "#eee",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text>Fichier actuel : {document.file_url}</Text>
          </View>
        </>
      )}

      {fileUri &&
        (fileMime.startsWith("image/") ? (
          <Image
            source={{ uri: fileUri }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 10,
              marginVertical: 16,
            }}
          />
        ) : (
          <View
            style={{
              padding: 12,
              backgroundColor: "#eee",
              borderRadius: 8,
              marginVertical: 16,
            }}
          >
            <Text>{fileName}</Text>
          </View>
        ))}

      {fileUri && (
        <TouchableOpacity
          onPress={() => {
            setFileUri(null);
            setFileName(null);
            setFileMime("application/octet-stream");
          }}
          style={[styles.button, { backgroundColor: "red" }]}
        >
          <Text style={styles.buttonText}>Retirer le fichier</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={() => {
          Alert.alert(
            "Confirmer la suppression",
            "Es-tu sûr de vouloir supprimer ce document ? Cette action est irréversible.",
            [
              { text: "Annuler", style: "cancel" },
              {
                text: "Supprimer",
                style: "destructive",
                onPress: handleDelete,
              },
            ]
          );
        }}
      >
        <Text style={styles.buttonText}>Supprimer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
