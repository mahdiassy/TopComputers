/**
 * Image Composition Utility
 * Handles compositing images with default backgrounds
 */

const DEFAULT_BACKGROUND_PATH = '/image.png';

export interface CompositionOptions {
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
}

export class ImageComposition {
  /**
   * Load an image from URL (public method for external use)
   */
  static loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return this.loadImage(url);
  }

  /**
   * Load an image from URL
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Composite an image onto the default background
   * Centers the foreground image on the background
   */
  static async compositeWithBackground(
    foregroundImageUrl: string,
    options: CompositionOptions = {}
  ): Promise<File> {
    try {
      // Load both images
      const [background, foreground] = await Promise.all([
        this.loadImage(DEFAULT_BACKGROUND_PATH),
        this.loadImage(foregroundImageUrl)
      ]);

      // Use background dimensions or specified dimensions
      const width = options.targetWidth || background.width;
      const height = options.targetHeight || background.height;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw background (scaled to canvas size)
      ctx.drawImage(background, 0, 0, width, height);

      // Calculate foreground position to center it
      let fgWidth = foreground.width;
      let fgHeight = foreground.height;

      // Scale foreground to fit within background (with some padding)
      const maxFgWidth = width * 0.9; // 90% of background width
      const maxFgHeight = height * 0.9; // 90% of background height

      if (fgWidth > maxFgWidth || fgHeight > maxFgHeight) {
        const scale = Math.min(maxFgWidth / fgWidth, maxFgHeight / fgHeight);
        fgWidth = fgWidth * scale;
        fgHeight = fgHeight * scale;
      }

      // Center the foreground
      const x = (width - fgWidth) / 2;
      const y = (height - fgHeight) / 2;

      // Draw foreground image centered
      ctx.drawImage(foreground, x, y, fgWidth, fgHeight);

      // Convert to blob and then to file
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error('Failed to create blob');
            }
            const file = new File([blob], `composed-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(file);
          },
          'image/jpeg',
          options.quality || 0.95
        );
      });
    } catch (error) {
      console.error('Error compositing image with background:', error);
      throw error;
    }
  }

  /**
   * Get the default background URL
   */
  static getDefaultBackgroundUrl(): string {
    return DEFAULT_BACKGROUND_PATH;
  }

  /**
   * Composite a cropped image with the background
   * This is specifically for the ImageCropper component
   */
  static async compositeCroppedImage(
    sourceImage: HTMLImageElement,
    cropData: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    scaleX: number,
    scaleY: number,
    rotation: number = 0,
    options: CompositionOptions = {}
  ): Promise<File> {
    try {
      // Load background
      const background = await this.loadImage(DEFAULT_BACKGROUND_PATH);

      // Use background dimensions
      const bgWidth = background.width;
      const bgHeight = background.height;

      // Create canvas for the background
      const canvas = document.createElement('canvas');
      canvas.width = bgWidth;
      canvas.height = bgHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw background first
      ctx.drawImage(background, 0, 0, bgWidth, bgHeight);

      // Create temporary canvas for cropped image
      const cropCanvas = document.createElement('canvas');
      const cropWidth = cropData.width * scaleX;
      const cropHeight = cropData.height * scaleY;
      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;
      const cropCtx = cropCanvas.getContext('2d');

      if (!cropCtx) {
        throw new Error('Failed to get crop canvas context');
      }

      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = 'high';

      // Apply rotation to cropped image if needed
      if (rotation !== 0) {
        const centerX = cropWidth / 2;
        const centerY = cropHeight / 2;
        cropCtx.translate(centerX, centerY);
        cropCtx.rotate((rotation * Math.PI) / 180);
        cropCtx.translate(-centerX, -centerY);
      }

      // Draw cropped portion
      cropCtx.drawImage(
        sourceImage,
        cropData.x * scaleX,
        cropData.y * scaleY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Calculate how to fit cropped image onto background
      const fgWidth = cropWidth;
      const fgHeight = cropHeight;

      // Scale to fit within background (with padding)
      const maxFgWidth = bgWidth * 0.85;
      const maxFgHeight = bgHeight * 0.85;

      let finalWidth = fgWidth;
      let finalHeight = fgHeight;

      if (fgWidth > maxFgWidth || fgHeight > maxFgHeight) {
        const scale = Math.min(maxFgWidth / fgWidth, maxFgHeight / fgHeight);
        finalWidth = fgWidth * scale;
        finalHeight = fgHeight * scale;
      }

      // Center on background
      const x = (bgWidth - finalWidth) / 2;
      const y = (bgHeight - finalHeight) / 2;

      // Draw the cropped image onto the background canvas
      ctx.drawImage(cropCanvas, x, y, finalWidth, finalHeight);

      // Convert to file
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error('Failed to create blob');
            }
            const file = new File([blob], `cropped-composed-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(file);
          },
          'image/jpeg',
          options.quality || 0.95
        );
      });
    } catch (error) {
      console.error('Error compositing cropped image:', error);
      throw error;
    }
  }
}
