export function approxBytesFromDataUrl(dataUrl: string): number {
  const idx = dataUrl.indexOf(',');
  const b64 = idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

export function compressDataUrlIfNeeded(
  dataUrl: string,
  maxBytes: number,
): Promise<string> {
  if (approxBytesFromDataUrl(dataUrl) <= maxBytes) {
    return Promise.resolve(dataUrl);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas context unavailable'));
      ctx.drawImage(img, 0, 0);

      let quality = 0.9;
      let out = canvas.toDataURL('image/jpeg', quality);
      while (approxBytesFromDataUrl(out) > maxBytes && quality > 0.4) {
        quality -= 0.1;
        out = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(out);
    };
    img.onerror = () => reject(new Error('failed to load image for compression'));
    img.src = dataUrl;
  });
}
