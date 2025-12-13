/**
 * Image utilities for compressing and converting images to Base64
 * Used for storing profile pictures in Firestore (free tier friendly)
 */

export interface CompressedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  sizeKB: number;
}

/**
 * Compress and resize an image file, returning a Base64 data URL
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default 200px for profile pics)
 * @param maxHeight - Maximum height (default 200px for profile pics)
 * @param quality - JPEG quality 0-1 (default 0.8)
 * @returns Promise with compressed image data
 */
export async function compressImage(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for better compression (or PNG if transparency needed)
        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);
        
        // Calculate size in KB
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);
        
        resolve({
          base64,
          mimeType,
          width,
          height,
          sizeKB
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate that a string is a valid Base64 image data URL
 */
export function isValidBase64Image(str: string): boolean {
  return str.startsWith('data:image/') && str.includes('base64,');
}

/**
 * Get the size of a Base64 string in KB
 */
export function getBase64SizeKB(base64: string): number {
  // Remove the data URL prefix to get just the base64 data
  const base64Data = base64.split(',')[1] || base64;
  // Base64 encodes 3 bytes as 4 characters
  return Math.round((base64Data.length * 3) / 4 / 1024);
}
