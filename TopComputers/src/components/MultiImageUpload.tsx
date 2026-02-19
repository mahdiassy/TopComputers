import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, AlertCircle } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { ImageOptimizer } from '../utils/imageOptimization';
import { ImageComposition } from '../utils/imageComposition';
import toast from 'react-hot-toast';

interface MultiImageUploadProps {
  productId?: string;
  existingImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  showDefaultBackground?: boolean; // Show default background for empty slots
}

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
  error?: string;
}

export default function MultiImageUpload({
  productId,
  existingImages = [],
  onImagesChange,
  maxImages = 10,
  className,
  showDefaultBackground = true // Default to true
}: MultiImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>(() => 
    existingImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProductImage } = useCatalog();

  // PERFORMANCE OPTIMIZATION: Memoized callbacks
  const handleImagesUpdate = useCallback((updatedImages: ImagePreview[]) => {
    setImages(updatedImages);
    const imageUrls = updatedImages.map(img => img.url).filter(url => url && !url.startsWith('blob:'));
    onImagesChange(imageUrls);
  }, [onImagesChange]);

  const processFiles = useCallback(async (files: File[]) => {
    // Check total image limit
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
      return;
    }

    // Create preview objects for immediate UI feedback
    const newImagePreviews: ImagePreview[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file), // Temporary preview URL
      file,
      isUploading: true,
    }));

    // Add to state immediately for better UX
    const updatedImages = [...images, ...newImagePreviews];
    setImages(updatedImages);

    // COST OPTIMIZATION: Process uploads one by one to avoid overwhelming the system
    for (let i = 0; i < newImagePreviews.length; i++) {
      const preview = newImagePreviews[i];
      if (!preview.file) continue;

      try {
        // Validate file before upload
        const validation = ImageOptimizer.validateImageFile(preview.file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        let uploadedUrl: string;
        
        if (productId) {
          // Upload to Firebase Storage (when configured)
          uploadedUrl = await uploadProductImage(preview.file, productId);
        } else {
          // For new products, optimize and create data URL
          const optimizedFile = await ImageOptimizer.optimizeImage(preview.file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.8,
            format: 'webp',
            maxSizeKB: 500
          });

          uploadedUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(optimizedFile);
          });
        }

        // Update the preview with the uploaded URL
        setImages(prevImages => {
          const updated = prevImages.map(img => 
            img.id === preview.id 
              ? { ...img, url: uploadedUrl, isUploading: false, file: undefined }
              : img
          );
          
          // Clean up temporary blob URL
          if (preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
          
          return updated;
        });

      } catch (error) {
        console.error('Upload error:', error);
        
        // Update with error state
        setImages(prevImages => {
          const updated = prevImages.map(img => 
            img.id === preview.id 
              ? { ...img, isUploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
              : img
          );
          return updated;
        });

        toast.error(`Failed to upload ${preview.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update parent component with final URLs
    setTimeout(() => {
      setImages(currentImages => {
        const finalImages = currentImages.filter(img => !img.error);
        handleImagesUpdate(finalImages);
        return finalImages;
      });
    }, 100);

  }, [images, maxImages, productId, uploadProductImage, handleImagesUpdate]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      processFiles(files);
    } else {
      toast.error('Please drop image files only');
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Drag and drop reordering functions
  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    setImages(prevImages => {
      const newImages = [...prevImages];
      const draggedImage = newImages[draggedIndex];
      
      // Remove from old position
      newImages.splice(draggedIndex, 1);
      // Insert at new position
      newImages.splice(dropIndex, 0, draggedImage);
      
      return newImages;
    });
    
    setDraggedIndex(null);
  }, [draggedIndex]);

  const handleImageDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prevImages => {
      const imageToRemove = prevImages.find(img => img.id === imageId);
      
      // Clean up blob URL if it exists
      if (imageToRemove?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      
      const updated = prevImages.filter(img => img.id !== imageId);
      handleImagesUpdate(updated);
      return updated;
    });
  }, [handleImagesUpdate]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {images.length >= maxImages 
            ? `Maximum ${maxImages} images reached` 
            : 'Click to select multiple images or drag and drop'
          }
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Hold Ctrl/Cmd to select multiple files • PNG, JPG, GIF up to 10MB each ({images.length}/{maxImages})
        </p>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Image Order:</strong> The first image will be the main product image. You can drag and drop to reorder images.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
              draggable={!image.isUploading}
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragEnd={handleImageDragEnd}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {image.isUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500">Uploading...</p>
                    </div>
                  </div>
                ) : image.error ? (
                  <div className="w-full h-full flex items-center justify-center text-red-500">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">{image.error}</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default background if image fails to load
                      if (showDefaultBackground) {
                        e.currentTarget.src = ImageComposition.getDefaultBackgroundUrl();
                      }
                    }}
                  />
                )}
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Order Badge */}
              {index === 0 ? (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                  Main Image
                </div>
              ) : (
                <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">
                  #{index + 1}
                </div>
              )}
            </div>
          ))}
          
          {/* Add More Button */}
          {images.length < maxImages && (
            <button
              onClick={openFileDialog}
              className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-500">Add More</p>
              </div>
            </button>
          )}
        </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="ml-4 space-y-1">
          <li>• First image will be used as the main product image</li>
          <li>• Images are automatically optimized and compressed</li>
          <li>• Recommended size: 1200x1200px for best quality</li>
          <li>• WebP format will be used for smaller file sizes</li>
        </ul>
      </div>
    </div>
  );
}
