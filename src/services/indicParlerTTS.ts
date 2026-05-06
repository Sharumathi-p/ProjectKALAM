/**
 * Indic Parler TTS Service
 * Tamil text-to-speech with voice cloning support
 * 
 * This service integrates:
 * 1. Indic Parler TTS for Tamil pronunciation
 * 2. Voice cloning for personalization
 * 3. Local model training for Tanglish support
 */

// Configuration
const INDIC_PARLER_API_URL = import.meta.env.VITE_INDIC_PARLER_API_URL || 'http://localhost:8000'

export interface TTSOptions {
  text: string
  voiceId?: string // For voice cloning
  language?: 'ta' | 'en' | 'tanglish' // Tamil, English, or Tanglish
  speed?: number
  pitch?: number
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'calm'
}

export interface VoiceCloneOptions {
  audioSamples: Blob[]
  voiceName: string
  description?: string
}

/**
 * Check if Indic Parler TTS is available
 */
export const isIndicParlerAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${INDIC_PARLER_API_URL}/health`, {
      method: 'GET',
    })
    return response.ok
  } catch (error) {
    console.log('Indic Parler TTS not available, using fallback')
    return false
  }
}

/**
 * Synthesize speech using Indic Parler TTS with Tamil model
 */
export const synthesizeTamilSpeech = async (
  options: TTSOptions
): Promise<Blob> => {
  try {
    const response = await fetch(`${INDIC_PARLER_API_URL}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: options.text,
        language: options.language || 'tanglish',
        voice_id: options.voiceId,
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0,
        emotion: options.emotion || 'neutral',
        model: 'indic-parler-tamil', // Tamil model
      }),
    })

    if (!response.ok) {
      throw new Error('Indic Parler TTS synthesis failed')
    }

    return await response.blob()
  } catch (error) {
    console.error('Indic Parler TTS error:', error)
    throw error
  }
}

/**
 * Clone voice using audio samples
 * Combines Indic Parler TTS with voice cloning
 */
export const cloneVoiceWithTamil = async (
  options: VoiceCloneOptions
): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('voice_name', options.voiceName)
    formData.append('description', options.description || '')
    formData.append('base_model', 'indic-parler-tamil')

    options.audioSamples.forEach((sample, index) => {
      formData.append(`audio_${index}`, sample, `sample_${index}.wav`)
    })

    const response = await fetch(`${INDIC_PARLER_API_URL}/clone-voice`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Voice cloning failed')
    }

    const data = await response.json()
    return data.voice_id
  } catch (error) {
    console.error('Voice cloning error:', error)
    throw error
  }
}

/**
 * Train local model with custom Tanglish data
 */
export const trainTanglishModel = async (
  trainingData: Array<{ text: string; audio: Blob }>
): Promise<void> => {
  try {
    const formData = new FormData()
    
    trainingData.forEach((item, index) => {
      formData.append(`text_${index}`, item.text)
      formData.append(`audio_${index}`, item.audio, `training_${index}.wav`)
    })

    const response = await fetch(`${INDIC_PARLER_API_URL}/train`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Model training failed')
    }

    console.log('Tanglish model training started')
  } catch (error) {
    console.error('Training error:', error)
    throw error
  }
}

/**
 * Get available Tamil voices
 */
export const getTamilVoices = async (): Promise<Array<{
  id: string
  name: string
  language: string
  gender: string
}>> => {
  try {
    const response = await fetch(`${INDIC_PARLER_API_URL}/voices`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch voices')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching voices:', error)
    return []
  }
}

/**
 * Preprocess Tanglish text for better pronunciation
 * Separates Tamil and English words for optimal synthesis
 */
export const preprocessTanglishText = (text: string): {
  processedText: string
  segments: Array<{ text: string; language: 'ta' | 'en' }>
} => {
  // Common Tamil words in romanized form
  const tamilWords = new Set([
    'enna', 'epdi', 'irukka', 'naan', 'nee', 'yen', 'romba', 'nalla',
    'seri', 'aama', 'illa', 'puriyuthu', 'pannu', 'paru', 'sollu',
    'vidu', 'ellam', 'ippo', 'nethu', 'naalaikku', 'innikku',
    'unakku', 'enakku', 'kandippa', 'bayangara', 'chinna', 'periya',
    'da', 'di', 'la', 'nu', 'pa', 'ma', 'ya'
  ])

  const words = text.split(/\s+/)
  const segments: Array<{ text: string; language: 'ta' | 'en' }> = []
  
  let currentSegment = { text: '', language: 'en' as 'ta' | 'en' }
  
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
    const isTamil = tamilWords.has(cleanWord)
    const lang = isTamil ? 'ta' : 'en'
    
    if (currentSegment.language === lang) {
      currentSegment.text += (currentSegment.text ? ' ' : '') + word
    } else {
      if (currentSegment.text) {
        segments.push({ ...currentSegment })
      }
      currentSegment = { text: word, language: lang }
    }
  })
  
  if (currentSegment.text) {
    segments.push(currentSegment)
  }

  return {
    processedText: text,
    segments
  }
}

/**
 * Synthesize Tanglish speech with optimal pronunciation
 * Uses segment-based synthesis for better quality
 */
export const synthesizeTanglishSpeech = async (
  text: string,
  voiceId?: string
): Promise<Blob> => {
  const { segments } = preprocessTanglishText(text)
  
  // If only one language, use simple synthesis
  if (segments.every(s => s.language === segments[0].language)) {
    return synthesizeTamilSpeech({
      text,
      voiceId,
      language: segments[0].language === 'ta' ? 'ta' : 'tanglish'
    })
  }

  // Multi-segment synthesis for mixed language
  const audioSegments: Blob[] = []
  
  for (const segment of segments) {
    const audio = await synthesizeTamilSpeech({
      text: segment.text,
      voiceId,
      language: segment.language === 'ta' ? 'ta' : 'en'
    })
    audioSegments.push(audio)
  }

  // Concatenate audio segments
  return concatenateAudioBlobs(audioSegments)
}

/**
 * Concatenate multiple audio blobs into one
 */
const concatenateAudioBlobs = async (blobs: Blob[]): Promise<Blob> => {
  // This is a simplified version - in production, use Web Audio API
  // for proper audio concatenation
  const arrayBuffers = await Promise.all(
    blobs.map(blob => blob.arrayBuffer())
  )
  
  return new Blob(arrayBuffers, { type: 'audio/wav' })
}

export default {
  isIndicParlerAvailable,
  synthesizeTamilSpeech,
  synthesizeTanglishSpeech,
  cloneVoiceWithTamil,
  trainTanglishModel,
  getTamilVoices,
  preprocessTanglishText,
}
