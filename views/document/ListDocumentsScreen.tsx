import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase.ts";
import DocumentCard from "../../components/DocumentCard.tsx";
import FilterDocument from "../../components/FilterDocument.tsx";
import { styles } from "../../styles.ts";

type Props = {
  navigate: (screen: "List" | "Add" | "Detail" | "Edit", params?: any) => void;
};

type Document = {
  id: number;
  title: string;
  description: string;
  file_url: string;
  user_id: string;
  categories: string[];
  keywords: string[];
  created_at: string;
  updated_at: string;
};

export default function ListDocumentsScreen({ navigate }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setDocuments(data);
      setFiltered(data);
    }
    setLoading(false);
  }

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, paddingTop: 16, paddingHorizontal: 16 }}>
      <FilterDocument documents={documents} onFilter={setFiltered} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DocumentCard document={item} navigate={navigate} />
        )}
      />

      <TouchableOpacity
        onPress={() => navigate("Add")}
        style={styles.addButton}
      >
        <Text style={{ color: "white", fontSize: 32 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
