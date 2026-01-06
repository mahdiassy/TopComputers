import { useState, useRef } from 'react';
import { useMedia } from '../contexts/MediaContext';
import { Upload, Trash2, Image as ImageIcon, X, Copy, Check, Crop } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCropper from '../components/ImageCropper';

export default function AdminMedia() {
  const { media, loading, uploadMedia, deleteMedia } = useMedia();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropImageId, setCropImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Only image files are allowed');
    }

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      await uploadMedia(validFiles, (percentage) => {
        setUploadProgress(percentage);
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMedia(mediaId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Upload the new cropped image first
      await uploadMedia([croppedFile], (percentage) => {
        setUploadProgress(percentage);
      });
      
      // Delete the original image after successful upload
      if (cropImageId) {
        await deleteMedia(cropImageId);
        console.log('Original image deleted after crop');
      }
      
      setCropImageUrl(null);
      setCropImageId(null);
      toast.success('Cropped image saved and original deleted!');
    } catch (error) {
      console.error('Error saving cropped image:', error);
      toast.error('Failed to save cropped image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage images • All uploads are automatically compressed for optimal performance
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Upload className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {uploadProgress === 0 ? 'Compressing images...' : `Uploading... ${uploadProgress}%`}
            </span>
            {uploadProgress > 0 && (
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{uploadProgress}%</span>
            )}
          </div>
          {uploadProgress > 0 && (
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{media.length}</p>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No images yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your first images to get started</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            Upload Images
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(item.url)}
            >
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(item.size)}
                </p>
              </div>
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCropImageUrl(item.url);
                    setCropImageId(item.id);
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
                  title="Crop & Resize"
                >
                  <Crop className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.url, item.id);
                  }}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    copiedId === item.id 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-4 h-4 inline mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline mr-1" />
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropImageUrl && (
        <ImageCropper
          imageUrl={cropImageUrl}
          onComplete={handleCropComplete}
          onCancel={() => setCropImageUrl(null)}
        />
      )}
    </div>
  );
}
