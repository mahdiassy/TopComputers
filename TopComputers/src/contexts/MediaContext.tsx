import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadToImgBB, type ImgBBUploadResult } from '../utils/cloudinaryUpload';
import { compressImage } from '../utils/imageCompression';
import toast from 'react-hot-toast';

export interface MediaItem {
  id: string;
  url: string;
  imageId: string;
  deleteUrl?: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  uploadedAt: Date;
  uploadedBy?: string;
}

interface MediaContextType {
  media: MediaItem[];
  loading: boolean;
  uploadMedia: (files: File[], onProgress?: (percentage: number) => void) => Promise<MediaItem[]>;
  deleteMedia: (mediaId: string) => Promise<void>;
  refreshMedia: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'media'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaItems: MediaItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        mediaItems.push({
          id: docSnap.id,
          url: data.url,
          imageId: data.imageId || data.publicId || '',
          deleteUrl: data.deleteUrl,
          name: data.name,
          size: data.size,
          type: data.type,
          width: data.width,
          height: data.height,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          uploadedBy: data.uploadedBy,
        });
      });
      setMedia(mediaItems);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media library');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const uploadMedia = async (files: File[], onProgress?: (percentage: number) => void): Promise<MediaItem[]> => {
    const uploadedItems: MediaItem[] = [];
    
    try {
      for (const file of files) {
        // Compress image before upload (only for image files)
        let fileToUpload = file;
        if (file.type.startsWith('image/')) {
          const originalSize = (file.size / 1024).toFixed(2);
          console.log(`[UPLOAD] Original file: ${file.name} (${originalSize}KB)`);
          console.log(`[UPLOAD] Starting aggressive compression...`);
          
          fileToUpload = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.75,
          });
          
          const compressedSize = (fileToUpload.size / 1024).toFixed(2);
          const savedPercent = (((file.size - fileToUpload.size) / file.size) * 100).toFixed(1);
          console.log(`[UPLOAD] Compression complete! ${originalSize}KB → ${compressedSize}KB (saved ${savedPercent}%)`);
        }

        // Upload to ImgBB
        const result: ImgBBUploadResult = await uploadToImgBB(fileToUpload, (progress) => {
          if (onProgress) {
            onProgress(progress.percentage);
          }
        });

        // Save metadata to Firestore
        const mediaData = {
          url: result.display_url,
          imageId: result.id,
          deleteUrl: result.delete_url,
          name: result.title || file.name,
          size: result.size,
          type: file.type,
          width: result.width,
          height: result.height,
          uploadedAt: Timestamp.now(),
          uploadedBy: 'admin',
        };

        const docRef = await addDoc(collection(db, 'media'), mediaData);

        const mediaItem: MediaItem = {
          id: docRef.id,
          ...mediaData,
          uploadedAt: new Date(),
        };

        uploadedItems.push(mediaItem);
      }

      toast.success(`${files.length} file(s) uploaded successfully!`);
      return uploadedItems;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
      throw error;
    }
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'media', mediaId));
      
      toast.success('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
      throw error;
    }
  };

  const refreshMedia = () => {
    setLoading(true);
  };

  return (
    <MediaContext.Provider value={{ media, loading, uploadMedia, deleteMedia, refreshMedia }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }
  return context;
}
