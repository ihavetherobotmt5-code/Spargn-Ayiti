export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

interface GoogleToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: (response: { error?: string } & GoogleToken) => void;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: { error?: string } & GoogleToken) => void;
}

const GOOGLE_API_BASE = 'https://www.googleapis.com/drive/v3';

let tokenClient: TokenClient | null = null;
let cachedToken: GoogleToken | null = null;
let tokenExpiry: number = 0;

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

function loadGoogleApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
}

function loadGsiClient(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.gapi?.client) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client', () => resolve());
    };
    script.onerror = () => reject(new Error('Failed to load GAPI client'));
    document.head.appendChild(script);
  });
}

export async function initializeGoogleDrive(clientId: string): Promise<boolean> {
  try {
    await loadGoogleApi();
    await loadGsiClient();

    const config: TokenClientConfig = {
      client_id: clientId,
      scope: SCOPES.join(' '),
      callback: () => {},
    };

    tokenClient = window.google.accounts.oauth2.initTokenClient(config);

    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return false;
  }
}

export async function authenticate(clientId: string): Promise<string | null> {
  try {
    if (!tokenClient) {
      await initializeGoogleDrive(clientId);
    }

    if (cachedToken && Date.now() < tokenExpiry) {
      return cachedToken.access_token;
    }

    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        reject(new Error('Google API not initialized'));
        return;
      }

      tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        cachedToken = response as GoogleToken;
        tokenExpiry = Date.now() + ((response as GoogleToken).expires_in - 60) * 1000;
        resolve(cachedToken.access_token);
      };

      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

export function revokeAccess(): void {
  if (cachedToken?.access_token) {
    window.google?.accounts?.oauth2?.revoke(cachedToken.access_token, () => {});
  }
  cachedToken = null;
  tokenExpiry = 0;
}

export async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken.access_token;
  }
  return null;
}

export async function isTokenValid(): Promise<boolean> {
  return cachedToken !== null && Date.now() < tokenExpiry;
}

async function fetchWithAuth(url: string, accessToken: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    cachedToken = null;
    tokenExpiry = 0;
    throw new Error('Token expired');
  }

  return response;
}

export async function listFolders(accessToken: string, parentId?: string): Promise<DriveFolder[]> {
  const folderParent = parentId || 'root';
  try {
    const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and '${folderParent}' in parents and trashed = false`);
    const fields = encodeURIComponent('files(id, name)');
    const url = `${GOOGLE_API_BASE}/files?q=${query}&fields=${fields}&orderBy=name`;

    const response = await fetchWithAuth(url, accessToken);

    if (!response.ok) {
      throw new Error('Failed to list folders');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list folders:', error);
    return [];
  }
}

export async function getFolderById(accessToken: string, folderId: string): Promise<DriveFolder | null> {
  try {
    const fields = encodeURIComponent('id, name');
    const url = `${GOOGLE_API_BASE}/files/${folderId}?fields=${fields}`;

    const response = await fetchWithAuth(url, accessToken);

    if (!response.ok) {
      throw new Error('Failed to get folder');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get folder:', error);
    return null;
  }
}

export async function listMediaFiles(accessToken: string, folderId: string): Promise<DriveFile[]> {
  try {
    const imageQuery = encodeURIComponent(`(mimeType contains 'image/' or mimeType contains 'video/') and '${folderId}' in parents and trashed = false`);
    const fields = encodeURIComponent('files(id, name, mimeType, size, createdTime, thumbnailLink, webContentLink, webViewLink)');
    const url = `${GOOGLE_API_BASE}/files?q=${imageQuery}&fields=${fields}&orderBy=createdTime desc&pageSize=100`;

    const response = await fetchWithAuth(url, accessToken);

    if (!response.ok) {
      throw new Error('Failed to list media files');
    }

    const data = await response.json();
    return (data.files || []).map((file: DriveFile) => ({
      ...file,
      thumbnailLink: file.thumbnailLink || getThumbnailUrl(file.id, accessToken),
    }));
  } catch (error) {
    console.error('Failed to list media files:', error);
    return [];
  }
}

export function getThumbnailUrl(fileId: string, accessToken: string, size: number = 220): string {
  return `${GOOGLE_API_BASE}/files/${fileId}?alt=media&access_token=${accessToken}&thumbnailSize=${size}`;
}

export async function downloadFile(accessToken: string, fileId: string, fileName: string, mimeType: string, onProgress?: (progress: number) => void): Promise<File | null> {
  try {
    onProgress?.(10);

    const url = `${GOOGLE_API_BASE}/files/${fileId}?alt=media`;

    const response = await fetchWithAuth(url, accessToken);

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    onProgress?.(30);

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response body');
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (contentLength > 0 && onProgress) {
        const progress = 30 + Math.floor((receivedLength / contentLength) * 40);
        onProgress(progress);
      }
    }

    onProgress?.(75);

    const blob = new Blob(chunks, { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });

    onProgress?.(100);

    return file;
  } catch (error) {
    console.error('Failed to download file:', error);
    return null;
  }
}

export async function getFileMetadata(accessToken: string, fileId: string): Promise<DriveFile | null> {
  try {
    const fields = encodeURIComponent('id, name, mimeType, size, createdTime, thumbnailLink, webContentLink, webViewLink');
    const url = `${GOOGLE_API_BASE}/files/${fileId}?fields=${fields}`;

    const response = await fetchWithAuth(url, accessToken);

    if (!response.ok) {
      throw new Error('Failed to get file metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return null;
  }
}

export function getFilePreviewUrl(fileId: string, accessToken: string, mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return `${GOOGLE_API_BASE}/files/${fileId}?alt=media&access_token=${accessToken}`;
  } else if (mimeType.startsWith('video/')) {
    return `${GOOGLE_API_BASE}/files/${fileId}?alt=media&access_token=${accessToken}`;
  }
  return '';
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { error?: string } & GoogleToken) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
            callback: (response: { error?: string } & GoogleToken) => void;
          };
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
    gapi: {
      load: (type: string, callback: () => void) => void;
      client: {
        request: (options: { path: string; method?: string; params?: Record<string, unknown> }) => Promise<{ result: unknown }>;
      };
    };
  }
}
