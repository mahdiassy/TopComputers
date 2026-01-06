import { useState, useRef } from 'react';
import { useMedia } from '../contexts/MediaContext';
import { Upload, Image as ImageIcon, Check, Crop, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCropper from './ImageCropper';

interface MediaSelectorProps {
  onSelect: (url: string) => void;
  currentImage?: string;
  label?: string;
  required?: boolean;
}

export default function MediaSelector({ onSelect, currentImage, label = 'Image', required = false }: MediaSelectorProps) {
  const { media, loading, uploadMedia, deleteMedia } = useMedia();
  const [activeTab, setActiveTab] = useState<'media' | 'upload' | 'camera'>('media');
  const [selectedUrl, setSelectedUrl] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropImageId, setCropImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      
      // Upload to Media Library (automatically saves)
      const uploadedItems = await uploadMedia([file]);
      
      if (uploadedItems.length > 0) {
        const url = uploadedItems[0].url;
        setSelectedUrl(url);
        onSelect(url);
        setActiveTab('media'); // Switch to media tab to show it was added
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please capture an image');
      return;
    }

    try {
      setUploading(true);
      
      // Upload to Media Library (automatically saves and compresses)
      const uploadedItems = await uploadMedia([file]);
      
      if (uploadedItems.length > 0) {
        const url = uploadedItems[0].url;
        setSelectedUrl(url);
        onSelect(url);
        setActiveTab('media'); // Switch to media tab to show it was added
        toast.success('Photo captured and uploaded!');
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      toast.error('Failed to upload captured photo');
    } finally {
      setUploading(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleMediaSelect = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setUploading(true);
      
      // Upload the cropped image
      const uploadedItems = await uploadMedia([croppedFile]);
      
      if (uploadedItems.length > 0) {
        const url = uploadedItems[0].url;
        setSelectedUrl(url);
        onSelect(url);
        
        // Delete the original image after successful upload
        if (cropImageId) {
          await deleteMedia(cropImageId);
          console.log('Original image deleted after crop');
        }
      }
      
      setCropImageUrl(null);
      setCropImageId(null);
      toast.success('Cropped image saved and original deleted!');
    } catch (error) {
      console.error('Error saving cropped image:', error);
      toast.error('Failed to save cropped image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Current Image Preview */}
      {selectedUrl && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-500 dark:border-blue-400">
          <img
            src={selectedUrl}
            alt="Selected"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 font-medium transition-all duration-300 ${
            activeTab === 'media'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Select from Media
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-all duration-300 ${
            activeTab === 'upload'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload New
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`px-4 py-2 font-medium transition-all duration-300 ${
            activeTab === 'camera'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Take Photo
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'media' ? (
          // Media Library Grid
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No images in library</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Upload images to the media library first</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-1">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleMediaSelect(item.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 w-full ${
                        selectedUrl === item.url
                          ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {selectedUrl === item.url && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <div className="bg-blue-600 text-white rounded-full p-1.5">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </button>
                    {/* Crop Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCropImageUrl(item.url);
                        setCropImageId(item.id);
                      }}
                      className="absolute top-1 right-1 bg-purple-600 text-white p-1.5 rounded-lg hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                      title="Crop & Resize"
                    >
                      <Crop className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'camera' ? (
          // Camera Capture Tab
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-full max-w-md">
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-12 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 cursor-pointer bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <Camera className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {uploading ? 'Uploading...' : 'Take Photo'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to open camera and capture image
                </p>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          // Upload New Tab
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-full max-w-md">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {uploading ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

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
