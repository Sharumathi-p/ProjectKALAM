const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface Voice {
  voice_id: string
  name: string
  preview_url?: string
}

/**
 * Check if ElevenLabs is configured
 */
export const isElevenLabsConfigured = (): boolean => {
  return !!ELEVENLABS_API_KEY
}

/**
 * Get available voices from ElevenLabs
 */
export const getVoices = async (): Promise<Voice[]> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch voices')
  }

  const data = await response.json()
  return data.voices
}

/**
 * Synthesize speech using ElevenLabs
 */
export const synthesizeSpeech = async (
  text: string,
  voiceId: string,
  options?: {
    stability?: number
    similarityBoost?: number
  }
): Promise<Blob> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to synthesize speech')
  }

  return await response.blob()
}

/**
 * Create a custom voice from audio samples
 */
export const createVoice = async (
  name: string,
  description: string,
  audioFiles: File[]
): Promise<Voice> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description)

  audioFiles.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to create voice')
  }

  return await response.json()
}

/**
 * Delete a custom voice
 */
export const deleteVoice = async (voiceId: string): Promise<void> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete voice')
  }
}
