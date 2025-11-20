import { useEffect, useState } from "react";
import {
  View,
  Text,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../services/supabase.ts";
import { styles } from "../../styles.ts";

export default function DocumentDetailScreen({ params, navigate }: any) {
  const document = params?.document;
  const [userId, setUserId] = useState<string | null>(null);

  if (!document) {
    return <Text>Pas de document reçu</Text>;
  }

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Erreur récupération utilisateur :", error.message);
        setUserId(null);
      } else {
        setUserId(data?.user?.id ?? null);
      }
    }
    fetchUser();
  }, []);

  const canEdit = userId === document.user_id;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, marginTop: 16 }}>
      <TouchableOpacity
        onPress={() => navigate("List")}
        style={{ marginBottom: 16 }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>←</Text>
      </TouchableOpacity>
      <Text style={styles.detailTitle}>{document.title}</Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 5 }}
      >
        {document.categories.map((cat, idx) => (
          <Text style={styles.categoryText} key={idx}>
            {cat}
          </Text>
        ))}
      </View>
      <Text style={{ marginVertical: 8, fontSize: 16 }}>
        {document.description}
      </Text>
      <Text>Mots-clés: {document.keywords.join(", ")}</Text>
      <Text>
        Date création: {new Date(document.created_at).toLocaleDateString()}
      </Text>
      <Text>
        Date modification: {new Date(document.updated_at).toLocaleDateString()}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          Linking.openURL(
            supabase.storage.from("gedBucket").getPublicUrl(document.file_url)
              .data.publicUrl
          )
        }
      >
        <Text style={styles.buttonText}>Ouvrir le fichier</Text>
      </TouchableOpacity>

      {canEdit && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate("Edit", { document })}
        >
          <Text style={styles.buttonText}>Modifier le document</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
