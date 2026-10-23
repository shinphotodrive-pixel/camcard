/**
 * Client-side image compression and resizing utility for mobile camera uploads
 * Downscales multi-megapixel smartphone photos (12-50MP, 10-25MB)
 * to an optimal OCR size (~1400-1600px, ~250-400KB JPEG)
 * ensuring rapid transfer, zero timeouts, and maximum text clarity.
 */

export interface CompressedImageResult {
  dataUrl: string;
  cleanBase64: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export function compressCardImage(
  source: string | File | Blob,
  maxDimension = 1600,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const processImage = (img: HTMLImageElement) => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        reject(new Error('이미지 크기를 확인할 수 없습니다.'));
        return;
      }

      // Calculate scaled dimensions while preserving aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Canvas context initialization failed.'));
        return;
      }

      // Fill white background for transparent PNGs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw scaled image
      ctx.drawImage(img, 0, 0, width, height);

      // Export as high-quality optimized JPEG
      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      // Extract pure base64 without data URI prefix
      const commaIdx = dataUrl.indexOf(',');
      const cleanBase64 = commaIdx !== -1 ? dataUrl.substring(commaIdx + 1) : dataUrl;

      resolve({
        dataUrl,
        cleanBase64,
        mimeType,
        width,
        height,
        sizeBytes: Math.round((cleanBase64.length * 3) / 4),
      });
    };

    if (typeof source === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => processImage(img);
      img.onerror = (e) => reject(new Error('이미지 로딩에 실패했습니다.'));
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => processImage(img);
        img.onerror = () => reject(new Error('사진 파일 읽기에 실패했습니다.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
      reader.readAsDataURL(source);
    }
  });
}
