import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, Move } from 'lucide-react';
import { ImageComposition } from '../utils/imageComposition';

interface ImageCropperProps {
  imageUrl: string;
  onComplete: (croppedImageFile: File) => void;
  onCancel: () => void;
  useBackgroundComposition?: boolean; // New option to enable background composition
}

export default function ImageCropper({ imageUrl, onComplete, onCancel, useBackgroundComposition = true }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropMode, setIsCropMode] = useState(true); // Start in crop mode
  const imgRef = useRef<HTMLImageElement>(null);
  const croppedImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply crop and switch to positioning mode
  const handleApplyCrop = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Apply Crop clicked - switching to positioning mode');
    
    if (!completedCrop || !imgRef.current) {
      console.log('No crop or image ref');
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to data URL
    const croppedUrl = canvas.toDataURL('image/jpeg', 0.95);
    console.log('Cropped image created, setting mode to false');
    setCroppedImageUrl(croppedUrl);
    setIsCropMode(false);
  }, [completedCrop]);

  // Draw composite preview with background
  const drawCompositePreview = useCallback(async () => {
    if (!canvasRef.current || !croppedImgRef.current || !useBackgroundComposition || isCropMode) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Load background
      const background = await ImageComposition.loadImageFromUrl(ImageComposition.getDefaultBackgroundUrl());
      const foreground = croppedImgRef.current;

      // Set canvas to background size
      canvas.width = background.width;
      canvas.height = background.height;

      // Draw background
      ctx.drawImage(background, 0, 0, background.width, background.height);

      // Calculate scaled image dimensions
      const scaledWidth = foreground.naturalWidth * imageScale;
      const scaledHeight = foreground.naturalHeight * imageScale;

      // Center position if not set
      const x = imagePosition.x || (background.width - scaledWidth) / 2;
      const y = imagePosition.y || (background.height - scaledHeight) / 2;

      // Save context state
      ctx.save();

      // Apply rotation if any
      if (rotation !== 0) {
        const centerX = x + scaledWidth / 2;
        const centerY = y + scaledHeight / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // Draw foreground image
      ctx.drawImage(foreground, x, y, scaledWidth, scaledHeight);

      ctx.restore();
    } catch (error) {
      console.error('Error drawing preview:', error);
    }
  }, [useBackgroundComposition, imageScale, imagePosition, rotation, isCropMode]);

  // Redraw when image loads or parameters change
  useEffect(() => {
    if (croppedImgRef.current?.complete) {
      drawCompositePreview();
    }
  }, [drawCompositePreview]);

  // Handle image drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!useBackgroundComposition || isCropMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  }, [imagePosition, useBackgroundComposition, isCropMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !useBackgroundComposition || isCropMode) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart, useBackgroundComposition, isCropMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getCroppedImg = useCallback(async () => {
    // In crop mode with background composition, don't process yet
    if (useBackgroundComposition && isCropMode) {
      return;
    }
    
    if (!useBackgroundComposition) {
      // Original simple crop without background
      if (!completedCrop || !imgRef.current) return;

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('No 2d context');

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (rotation !== 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise<File>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) throw new Error('Canvas is empty');
            const file = new File([blob], `cropped-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(file);
          },
          'image/jpeg',
          0.95
        );
      });
    }

    // Save the canvas with background composition
    if (!canvasRef.current) return;

    await drawCompositePreview(); // Ensure latest preview is drawn

    return new Promise<File>((resolve) => {
      canvasRef.current!.toBlob(
        (blob) => {
          if (!blob) throw new Error('Canvas is empty');
          const file = new File([blob], `composed-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(file);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [rotation, useBackgroundComposition, drawCompositePreview]);

  const handleSave = async () => {
    // Don't save if still in crop mode with background composition
    if (useBackgroundComposition && isCropMode) {
      return;
    }
    
    try {
      setProcessing(true);
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        onComplete(croppedFile);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crop & Resize Image
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          {useBackgroundComposition ? (
            isCropMode ? (
              /* Step 1: Crop Mode */
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={undefined}
                >
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Crop"
                    crossOrigin="anonymous"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '60vh',
                      transform: `rotate(${rotation}deg)`,
                    }}
                    className="mx-auto"
                  />
                </ReactCrop>
              </div>
            ) : (
              /* Step 2: Position & Scale Mode with Background */
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div 
                  ref={containerRef}
                  className="relative mx-auto"
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <canvas
                    ref={canvasRef}
                    className="mx-auto max-w-full max-h-[60vh] object-contain"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  />
                  <img
                    ref={croppedImgRef}
                    src={croppedImageUrl || ''}
                    alt="Cropped"
                    crossOrigin="anonymous"
                    style={{ display: 'none' }}
                    onLoad={drawCompositePreview}
                  />
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Scale:
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={imageScale}
                      onChange={(e) => setImageScale(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    {(imageScale * 100).toFixed(0)}%
                  </label>
                  
                  <button
                    onClick={() => {
                      setIsCropMode(true);
                      setCroppedImageUrl(null);
                    }}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Re-crop
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Original ReactCrop implementation without background */
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop"
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    transform: `rotate(${rotation}deg)`,
                  }}
                  className="mx-auto"
                />
              </ReactCrop>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> {useBackgroundComposition ? (
                isCropMode ? 'Drag the crop handles to select the area you want, then click "Apply Crop" to position it on the background.' : 'Drag to reposition the cropped image. Use the scale slider to resize it. The background fills empty spaces.'
              ) : 'Drag the corners or edges to resize the crop area. '}The final image will be automatically compressed for optimal web performance.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleRotate}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className="w-4 h-4" />
              Rotate 90°
            </button>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={processing}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              {useBackgroundComposition && isCropMode ? (
                <button
                  type="button"
                  onClick={(e) => handleApplyCrop(e)}
                  disabled={!completedCrop || processing}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Apply Crop
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Image
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
