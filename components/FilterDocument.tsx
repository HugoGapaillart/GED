import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { styles } from "../styles.ts";

type Props = {
  documents: any[];
  onFilter: (filteredDocs: any[]) => void;
};

export default function FiltreDocument({ documents, onFilter }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allCategories = useMemo(() => {
    const cats = Array.from(
      new Set(documents.flatMap((doc) => doc.categories || []))
    );
    return cats.sort((a, b) => a.localeCompare(b));
  }, [documents]);

  useEffect(() => {
    applyFilters();
  }, [search, selectedCategories, documents]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function applyFilters() {
    let filtered = [...documents];

    if (search.trim() !== "") {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.categories.some((c) => selectedCategories.includes(c))
      );
    }

    onFilter(filtered);
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <TextInput
        placeholder="Rechercher un document..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      <Text style={{ fontWeight: "bold", marginBottom: 8, marginTop: 10 }}>
        Filtrer par catégories :
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {allCategories.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleCategory(cat)}
              style={[
                styles.filterCategory,
                {
                  borderColor: isSelected ? "#007bff" : "#ccc",
                  backgroundColor: isSelected ? "#007bff" : "#f2f2f2",
                },
              ]}
            >
              <Text style={{ color: isSelected ? "white" : "black" }}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
