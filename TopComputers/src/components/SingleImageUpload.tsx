import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { ImageOptimizer } from '../utils/imageOptimization';
import { ImageComposition } from '../utils/imageComposition';
import toast from 'react-hot-toast';

interface SingleImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  showDefaultBackground?: boolean; // Show default background when no image
}

export default function SingleImageUpload({
  currentImage,
  onImageChange,
  placeholder = "Upload image",
  className = "",
  label,
  required = false,
  showDefaultBackground = true // Default to true for consistent backgrounds
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage } = useCatalog();

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setIsUploading(true);

      // Validate file
      const validation = ImageOptimizer.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create preview immediately
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload the image
      const uploadedUrl = await uploadImage(file);
      
      // Update with actual uploaded URL
      setPreviewUrl(uploadedUrl);
      onImageChange(uploadedUrl);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      
      // Reset preview on error
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  }, [uploadImage, onImageChange, currentImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    } else {
      toast.error('Please drop a valid image file');
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {!isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Change image"
              >
                <Upload className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        ) : showDefaultBackground ? (
          // Show default background when no image
          <div className="relative group">
            <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
              <img
                src={ImageComposition.getDefaultBackgroundUrl()}
                alt="Default background"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{placeholder}</span>
                  <span className="block text-xs mt-1 text-gray-500 dark:text-gray-400">Click to upload</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
              bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
            `}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Image className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{placeholder}</span>
                  <span className="text-xs mt-1">Drag & drop or click to browse</span>
                </>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Supported formats: JPG, PNG, WebP. Max size: 5MB
      </div>
    </div>
  );
}
