const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

export function getImageUrl(image) {
  if (!image) return ''
  if (/^(https?:|data:|blob:)/i.test(image)) return image
  return `${apiOrigin}/${image.replace(/^\/+/, '')}`
}