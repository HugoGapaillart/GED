import { useState } from "react";
import ListDocumentsScreen from "../views/document/ListDocumentsScreen.tsx";
import AddDocumentScreen from "../views/document/AddDocumentScreen.tsx";
import DocumentDetailScreen from "../views/document/DocumentDetailScreen.tsx";
import EditDocumentScreen from "../views/document/EditDocumentScreen.tsx";

type Screen = "List" | "Add" | "Detail" | "Edit";

type Params = {
  document?: any;
};

export default function AppNavigator() {
  const [screen, setScreen] = useState<Screen>("List");
  const [params, setParams] = useState<Params>({});

  const navigate = (nextScreen: Screen, nextParams?: Params) => {
    setScreen(nextScreen);
    if (nextParams) setParams(nextParams);
  };

  switch (screen) {
    case "List":
      return <ListDocumentsScreen navigate={navigate} />;
    case "Add":
      return <AddDocumentScreen navigate={navigate} />;
    case "Detail":
      return <DocumentDetailScreen navigate={navigate} params={params} />;
    case "Edit":
      return <EditDocumentScreen navigate={navigate} params={params} />;
  }
}
