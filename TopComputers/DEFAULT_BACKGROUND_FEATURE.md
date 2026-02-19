# Default Background Feature

## Overview
This feature ensures all products, categories, brands, and other items have a consistent background appearance by:
- Compositing uploaded images with a default background
- Displaying the default background when no image is present
- Automatically centering and scaling images on the background during cropping

## Default Background Image
**Location:** `/public/image.png`

This image is used as the default background for all items across the application.

## Components Updated

### 1. ImageComposition Utility (`src/utils/imageComposition.ts`)
A new utility class that handles:
- **`compositeWithBackground()`**: Composite any image with the default background
- **`compositeCroppedImage()`**: Special compositing for the ImageCropper component
- **`getDefaultBackgroundUrl()`**: Returns the default background path

### 2. ImageCropper Component (`src/components/ImageCropper.tsx`)
**New Prop:** `useBackgroundComposition?: boolean` (default: `true`)

When enabled, cropped images are automatically placed on the default background:
- The cropped portion is extracted
- It's centered on the default background
- Scaled to fit within 85% of the background dimensions
- Maintains aspect ratio

**Usage Example:**
```tsx
<ImageCropper
  imageUrl={uploadedImage}
  onComplete={handleCroppedImage}
  onCancel={handleCancel}
  useBackgroundComposition={true} // Enable background composition
/>
```

### 3. SingleImageUpload Component (`src/components/SingleImageUpload.tsx`)
**New Prop:** `showDefaultBackground?: boolean` (default: `true`)

When enabled:
- Displays the default background with an upload prompt when no image is present
- Shows a semi-transparent background with "Click to upload" overlay
- Provides visual consistency across all forms

**Usage Example:**
```tsx
<SingleImageUpload
  currentImage={product.imageUrl}
  onImageChange={handleImageChange}
  label="Product Image"
  showDefaultBackground={true} // Show default background when empty
/>
```

### 4. MultiImageUpload Component (`src/components/MultiImageUpload.tsx`)
**New Prop:** `showDefaultBackground?: boolean` (default: `true`)

When enabled:
- Falls back to default background if an image fails to load
- Provides consistent error handling across multiple images

**Usage Example:**
```tsx
<MultiImageUpload
  productId={productId}
  existingImages={product.images}
  onImagesChange={handleImagesChange}
  showDefaultBackground={true} // Enable background fallback
/>
```

### 5. OptimizedImage Component (`src/components/OptimizedImage.tsx`)
**New Prop:** `useDefaultBackground?: boolean` (default: `true`)

When enabled:
- Automatically uses default background when src is empty/null
- Shows default background on image load errors
- Ensures consistent display across the application

**Usage Example:**
```tsx
<OptimizedImage
  src={product.imageUrl || ''}
  alt={product.name}
  useDefaultBackground={true} // Use default background as fallback
/>
```

## How It Works

### 1. When Adding New Items (Products/Categories/Brands)
- Upload an image using SingleImageUpload or MultiImageUpload
- The image cropper opens with `useBackgroundComposition={true}`
- Crop your image as desired
- **Result:** The cropped image is automatically centered on the default background

### 2. When No Image Is Present
- Forms display the default background with an upload prompt
- Users see a consistent, professional appearance
- Click to upload replaces the background with the actual image

### 3. When Images Fail to Load
- OptimizedImage component automatically falls back to default background
- MultiImageUpload shows default background for broken images
- No broken image icons or empty spaces

## Composition Algorithm

The compositing algorithm:
1. Loads the default background image
2. Creates a canvas matching the background dimensions
3. Draws the background as the base layer
4. Scales the foreground image to fit within 85-90% of the background (with padding)
5. Centers the foreground image on the background
6. Exports as high-quality JPEG (95% quality)

## Customization

### Change Default Background
Replace `/public/image.png` with your desired background image. No code changes needed!

### Disable Background Composition
Set the respective props to `false`:
```tsx
<ImageCropper useBackgroundComposition={false} />
<SingleImageUpload showDefaultBackground={false} />
<MultiImageUpload showDefaultBackground={false} />
<OptimizedImage useDefaultBackground={false} />
```

### Adjust Scaling
Edit `imageComposition.ts` and modify these values:
```typescript
const maxFgWidth = width * 0.85; // 85% of background width
const maxFgHeight = height * 0.85; // 85% of background height
```

## Benefits

1. **Consistent Branding**: All products have the same background appearance
2. **Professional Look**: No empty spaces or broken images
3. **Better UX**: Users immediately see what the final result will look like
4. **Flexible**: Can be enabled/disabled per component
5. **No Manual Work**: Background composition happens automatically during cropping

## Testing

To test the feature:
1. Go to any product/category/brand admin page
2. Click "Add New" or "Edit"
3. Upload an image - you'll see it cropped with the default background
4. Try adding a product without an image - the default background shows
5. Try with a broken image URL - falls back to default background

## Performance Considerations

- Background image is loaded only once and cached by the browser
- Canvas compositing happens on the client side
- Image quality is maintained at 95% for optimal balance
- Lazy loading is still supported via OptimizedImage component
