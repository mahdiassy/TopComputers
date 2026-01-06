/**
 * ImgBB Upload Utility
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://api.imgbb.com/
 * 2. Click "Get API Key" (it's free, no credit card required)
 * 3. Sign up with your email
 * 4. Copy your API key
 * 5. Replace IMGBB_API_KEY below with your actual key
 */

const IMGBB_API_KEY = '80b00910b7784cdc86cf984fc20fe8fe'; // Your ImgBB API key

export interface ImgBBUploadResult {
  id: string;
  url: string;
  display_url: string;
  delete_url: string;
  width: number;
  height: number;
  size: number;
  time: string;
  title: string;
  thumb: {
    url: string;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload an image file to ImgBB
 */
export async function uploadToImgBB(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ImgBBUploadResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error?.message || 'Upload failed'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Send the request
    xhr.open('POST', 'https://api.imgbb.com/1/upload');
    xhr.send(formData);
  });
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(imageUrl: string): string {
  // ImgBB provides direct URLs, no transformation needed
  return imageUrl;
}
