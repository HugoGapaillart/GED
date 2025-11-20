import { supabase } from "./supabase.ts";

export async function createDocument(doc: any) {
  return supabase.from("documents").insert(doc).select();
}

export async function updateDocument(id: string, doc: any, userId: string) {
  return supabase
    .from("documents")
    .update({ ...doc, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select();
}

export async function deleteDocument(id: string, userId: string) {
  return supabase.from("documents").delete().eq("id", id).eq("user_id", userId);
}

export async function getDocuments() {
  return supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getDocumentById(id: string) {
  return supabase.from("documents").select("*").eq("id", id).single();
}

export async function searchDocuments(query: string) {
  if (!query) return getDocuments();

  return supabase
    .from("documents")
    .select("*")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false });
}

export async function uploadFile(uri: string, fileName: string, mimeType: string) {
  const response = await fetch(uri);
  const buffer = await response.arrayBuffer();
  const fileArray = new Uint8Array(buffer);

  const fullPath = `docs/${fileName}`;

  const { data, error } = await supabase.storage
    .from("gedBucket")
    .upload(fullPath, fileArray, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;
  if (!data?.path) throw new Error("Upload failed");

  return data.path;
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from("gedBucket")
    .remove([path]);

  if (error) throw error;
}
