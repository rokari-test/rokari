export interface ProcessImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: 'image/jpeg' | 'image/webp'
}

const ACCEPTED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

/**
 * Resize & compress an image file to a data URL for local catalog storage.
 */
export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {},
): Promise<string> {
  if (!ACCEPTED.has(file.type)) {
    throw new Error('Use JPG, PNG, or WebP.')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File is too large (max 10 MB).')
  }

  const maxWidth = options.maxWidth ?? 800
  const maxHeight = options.maxHeight ?? 1200
  const quality = options.quality ?? 0.82
  const mimeType = options.mimeType ?? 'image/jpeg'

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not process image.')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL(mimeType, quality)
}
