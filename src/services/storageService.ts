import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);

export interface UploadResult {
  url: string;
  source: 'firebase-storage' | 'server-upload' | 'base64';
  error?: string;
}

/**
 * Uploads an image file or base64 data to Firebase Storage.
 * If Firebase Storage is unavailable or restricted by permissions/CORS,
 * it automatically falls back to the backend /api/upload endpoint so administrators
 * can always upload photos without disruption.
 */
export const uploadSchoolAsset = async (
  fileOrBase64: File | string,
  fileName: string,
  category: string = 'gallery'
): Promise<UploadResult> => {
  const cleanName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `school-assets/${category}/${timestamp}_${cleanName}`;

  // 1. Try Firebase Storage
  try {
    const storageRef = ref(storage, storagePath);
    if (typeof fileOrBase64 === 'string') {
      // Base64 Data URL
      await uploadString(storageRef, fileOrBase64, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      return { url: downloadURL, source: 'firebase-storage' };
    } else {
      // File object
      const uploadTask = await uploadBytesResumable(storageRef, fileOrBase64);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      return { url: downloadURL, source: 'firebase-storage' };
    }
  } catch (storageError: any) {
    console.warn('Firebase Storage upload notice (falling back to server endpoint):', storageError?.message || storageError);

    // 2. Fallback to Express backend /api/upload
    try {
      let base64Data = '';
      if (typeof fileOrBase64 === 'string') {
        base64Data = fileOrBase64;
      } else {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrBase64);
        });
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: cleanName,
          category,
          title: fileName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.asset?.imageSrc) {
          return { url: data.asset.imageSrc, source: 'server-upload' };
        }
      }

      // If server returned ok with base64 data or fallback
      return { url: base64Data, source: 'base64' };
    } catch (serverErr: any) {
      console.warn('Server upload fallback:', serverErr);
      if (typeof fileOrBase64 === 'string') {
        return { url: fileOrBase64, source: 'base64' };
      }
      throw new Error('Unable to upload image file. Please check file format and try again.');
    }
  }
};
