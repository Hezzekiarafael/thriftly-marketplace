export const parseProfileList = (jsonString, legacyFormatKey) => {
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

export const getPrimaryValue = (jsonString, key) => {
  const list = parseProfileList(jsonString, key)
  if (list.length > 0) {
    return list[0][key] || ''
  }
  return ''
}
