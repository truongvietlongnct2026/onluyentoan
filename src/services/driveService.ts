import { Exam } from "../types";

/**
 * Service to interact with Google Drive API
 * Fetches PDF files from a specific folder.
 */
export async function fetchExamsFromDrive(): Promise<Exam[]> {
  const folderId = (import.meta as any).env.VITE_DRIVE_FOLDER_ID;
  const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;

  if (!folderId || !apiKey) {
    console.warn("Drive Folder ID or API Key is missing. Using mock fallback.");
    return [
      { id: '1', name: 'MÃ ĐỀ 01', driveId: '1ld_0f0cVhyUaYXWp-35oaOMladTqfNzv' }
    ];
  }

  // Google Drive API URL to list files in a folder
  // q: folderId in parents and mimeType = 'application/pdf' and trashed = false
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'+and+trashed=false&key=${apiKey}&fields=files(id,name)`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Drive API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Transform Drive files to Exam objects
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name.replace(/\.pdf$/i, '').toUpperCase(),
      driveId: file.id
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));
    
  } catch (error) {
    console.error("Failed to fetch exams from Drive:", error);
    return [];
  }
}
