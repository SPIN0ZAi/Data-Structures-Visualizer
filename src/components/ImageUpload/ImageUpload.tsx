import React, { useState, useRef, useCallback } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  currentImage?: string | null;
  userName: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  maxSizeKB?: number;
  maxDimension?: number;
}

// Allowed MIME types for security
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Validate file is actually an image by checking magic bytes
const validateImageMagicBytes = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 12);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }
      
      // Check magic bytes for JPEG, PNG, WebP
      const isJPEG = header.startsWith('ffd8ff');
      const isPNG = header.startsWith('89504e47');
      const isWebP = header.slice(0, 8) === '52494646' && header.slice(16, 24) === '57454250';
      
      resolve(isJPEG || isPNG || isWebP);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

// Validate image dimensions
const validateImageDimensions = (file: File, maxDimension: number): Promise<{ valid: boolean; width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: img.width <= maxDimension && img.height <= maxDimension && img.width >= 50 && img.height >= 50,
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, width: 0, height: 0 });
    };
    
    img.src = url;
  });
};

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts and special characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  userName,
  onUpload,
  onRemove,
  maxSizeKB = 2048, // 2MB default
  maxDimension = 2048, // 2048px max
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    // Check file extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: JPEG, PNG, WebP`;
    }

    // Check file size
    if (file.size > maxSizeKB * 1024) {
      return `File too large. Maximum size: ${maxSizeKB / 1024}MB`;
    }

    // Validate magic bytes (prevent fake extensions)
    const isValidImage = await validateImageMagicBytes(file);
    if (!isValidImage) {
      return 'Invalid image file. The file appears to be corrupted or not a valid image.';
    }

    // Validate dimensions
    const dimensions = await validateImageDimensions(file, maxDimension);
    if (!dimensions.valid) {
      if (dimensions.width < 50 || dimensions.height < 50) {
        return 'Image too small. Minimum size: 50x50 pixels.';
      }
      return `Image too large. Maximum dimensions: ${maxDimension}x${maxDimension} pixels.`;
    }

    return null;
  }, [maxSizeKB, maxDimension]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      // Validate the file
      const validationError = await validateFile(file);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload
      await onUpload(sanitizedFile);
      
      // Cleanup preview URL after successful upload
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  }, [validateFile, onUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onRemove();
    } catch (err) {
      setError('Failed to remove image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className="image-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !loading && fileInputRef.current?.click()}
        aria-label="Upload profile picture"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="file-input"
          aria-hidden="true"
        />

        {loading && (
          <div className="upload-loading">
            <div className="upload-spinner"></div>
            <span>Uploading...</span>
          </div>
        )}

        {!loading && displayImage && (
          <div className="current-image">
            <img src={displayImage} alt="Profile preview" />
            <div className="image-overlay">
              <span>📷 Change</span>
            </div>
          </div>
        )}

        {!loading && !displayImage && (
          <div className="upload-placeholder">
            <div className="placeholder-initial">{getInitial(userName)}</div>
            <div className="placeholder-text">
              <span className="placeholder-icon">📷</span>
              <span>Drop image here or click to upload</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="upload-info">
        <span>Accepted: JPEG, PNG, WebP</span>
        <span>Max size: {maxSizeKB / 1024}MB</span>
      </div>

      {currentImage && onRemove && !loading && (
        <button
          type="button"
          className="remove-image-btn"
          onClick={handleRemove}
        >
          Remove Photo
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
