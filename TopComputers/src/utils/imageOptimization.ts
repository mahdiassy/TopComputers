/**
 * COST OPTIMIZATION: Image utilities to reduce Firebase Storage costs
 * - Compress images before upload
 * - Convert to optimal formats (WebP)
 * - Resize to appropriate dimensions
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxSizeKB?: number;
}

export class ImageOptimizer {
  /**
   * Compress and optimize image file before upload
   */
  static async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'webp',
      maxSizeKB = 500
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Image compression failed'));
                return;
              }

              // Check if size is acceptable
              const sizeKB = blob.size / 1024;
              if (sizeKB > maxSizeKB) {
                // If still too large, try with lower quality
                const newQuality = Math.max(0.3, quality * 0.7);
                if (newQuality < quality) {
                  // Recursively compress with lower quality
                  canvas.toBlob(
                    (blob2) => {
                      if (!blob2) {
                        reject(new Error('Image compression failed'));
                        return;
                      }
                      const optimizedFile = new File(
                        [blob2],
                        this.generateOptimizedFileName(file.name, format),
                        { type: blob2.type }
                      );
                      resolve(optimizedFile);
                    },
                    `image/${format}`,
                    newQuality
                  );
                  return;
                }
              }

              const optimizedFile = new File(
                [blob],
                this.generateOptimizedFileName(file.name, format),
                { type: blob.type }
              );
              resolve(optimizedFile);
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnails for products to save bandwidth
   */
  static async generateThumbnail(
    file: File,
    size: number = 200
  ): Promise<File> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'webp',
      maxSizeKB: 50 // Very small for thumbnails
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Calculate scaling factor
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale

    width = Math.round(originalWidth * scale);
    height = Math.round(originalHeight * scale);

    return { width, height };
  }

  /**
   * Generate optimized filename with format extension
   */
  private static generateOptimizedFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    return `${nameWithoutExt}_optimized_${timestamp}.${format}`;
  }

  /**
   * Validate image file before processing
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 10MB' };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Unsupported image format. Use JPEG, PNG, WebP, or GIF' };
    }

    return { valid: true };
  }

  /**
   * Convert file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * COST OPTIMIZATION: Progressive image loading component
 * Load low-quality placeholder first, then high-quality image
 */
export class ProgressiveImageLoader {
  static generatePlaceholder(width: number, height: number): string {
    // Generate a simple colored placeholder
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/png', 0.1); // Very low quality
  }

  /**
   * Load image with progressive enhancement
   */
  static async loadProgressively(
    src: string,
    placeholder?: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      // Set placeholder first if provided
      if (placeholder) {
        img.src = placeholder;
        
        // Then load actual image
        setTimeout(() => {
          img.src = src;
        }, 100);
      } else {
        img.src = src;
      }
    });
  }
}

export default ImageOptimizer;
