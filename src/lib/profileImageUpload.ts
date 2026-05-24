import { processImageFile } from './imageUpload'

const ACCEPTED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export interface ProfileImageResult {
  dataUrl: string
  mimeType: string
  animated: boolean
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}

export async function processProfileImageFile(
  file: File,
  kind: 'avatar' | 'banner',
): Promise<ProfileImageResult> {
  if (!ACCEPTED.has(file.type)) {
    throw new Error('Use JPG, PNG, WebP, or GIF.')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('File is too large (max 8 MB).')
  }

  if (file.type === 'image/gif') {
    const dataUrl = await readFileAsDataUrl(file)
    return { dataUrl, mimeType: file.type, animated: true }
  }

  const dataUrl = await processImageFile(file, {
    maxWidth: kind === 'avatar' ? 512 : 1600,
    maxHeight: kind === 'avatar' ? 512 : 640,
    quality: 0.86,
    mimeType: file.type === 'image/webp' ? 'image/webp' : 'image/jpeg',
  })

  return {
    dataUrl,
    mimeType: file.type === 'image/webp' ? 'image/webp' : 'image/jpeg',
    animated: false,
  }
}
