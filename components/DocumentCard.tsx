import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles.ts";

type Props = {
  document: {
    id: number;
    title: string;
    description: string;
    categories: string[];
    file_url: string;
    user_id: string;
  };
  navigate: (screen: "List" | "Add" | "Detail", params?: any) => void;
};

export default function DocumentCard({ document, navigate }: Props) {
  return (
    <TouchableOpacity
      style={styles.documentContainer}
      onPress={() => navigate("Detail", { document })}
    >
      <Text style={styles.documentTitle}>{document.title}</Text>
      <Text numberOfLines={2} style={styles.description}>
        {document.description}
      </Text>

      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 5 }}
      >
        {document.categories.map((cat, idx) => (
          <Text style={styles.categoryText} key={idx}>
            {cat}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}
