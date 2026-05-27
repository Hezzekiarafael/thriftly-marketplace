export const parseProfileList = (jsonString, legacyFormatKey, userId = '') => {
  // Check localStorage first to bypass backend varchar(255) limit
  if (legacyFormatKey === 'alamat' && userId) {
    const local = localStorage.getItem(`alamat_${userId}`)
    if (local) {
      try { return JSON.parse(local) } catch (e) {}
    }
  }

  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  
  // Legacy single string fallback
  if (legacyFormatKey === 'alamat') {
    return [{ alamat: jsonString, lokasi: 'Semarang' }]
  }
  return []
}

export const getPrimaryValue = (jsonString, key, userId = '') => {
  const list = parseProfileList(jsonString, key, userId)
  if (list.length > 0) {
    return list[0][key] || ''
  }
  return ''
}
