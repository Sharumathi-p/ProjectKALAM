// Free Google Translate (no API key needed!)
// Using @vitalets/google-translate-api library

export interface TranslationResult {
  text: string
  detectedSourceLang: string
}

/**
 * Check if translation is configured
 * Google Translate is always available (no API key needed)
 */
export const isTranslationConfigured = (): boolean => {
  return true // Always available with free Google Translate
}

/**
 * Translate text using free Google Translate
 */
export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<TranslationResult> => {
  try {
    // Use free Google Translate API
    const url = 'https://translate.googleapis.com/translate_a/single'
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang || 'auto',
      tl: targetLang.toLowerCase(),
      dt: 't',
      q: text,
    })

    const response = await fetch(`${url}?${params}`)
    
    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const data = await response.json()
    
    // Parse Google Translate response
    let translatedText = ''
    if (data && data[0]) {
      for (const item of data[0]) {
        if (item[0]) {
          translatedText += item[0]
        }
      }
    }

    // Detect source language
    const detectedLang = data[2] || sourceLang || 'unknown'

    return {
      text: translatedText || text,
      detectedSourceLang: detectedLang,
    }
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback: return original text
    return {
      text: text,
      detectedSourceLang: sourceLang || 'unknown',
    }
  }
}

/**
 * Detect language of text using Google Translate
 */
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const result = await translateText(text, 'en')
    return result.detectedSourceLang.toLowerCase()
  } catch (error) {
    console.error('Language detection failed:', error)
    return 'en'
  }
}

/**
 * Get supported languages
 */
export const getSupportedLanguages = (): { code: string; name: string }[] => {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ur', name: 'Urdu' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'tr', name: 'Turkish' },
    { code: 'fa', name: 'Persian' },
    { code: 'he', name: 'Hebrew' },
    { code: 'sw', name: 'Swahili' },
    { code: 'af', name: 'Afrikaans' },
  ]
}
