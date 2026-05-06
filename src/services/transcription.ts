const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

/**
 * Transcribe audio using Groq's Whisper API (FREE!)
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  try {
    // Convert blob to file
    const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type })

    // Create form data
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-large-v3')
    formData.append('language', 'en')
    formData.append('response_format', 'json')

    // Call Groq Whisper API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Transcription failed')
    }

    const data = await response.json()
    return data.text || ''
  } catch (error: any) {
    console.error('Transcription error:', error)
    throw new Error(error.message || 'Failed to transcribe audio')
  }
}

/**
 * Analyze transcription and generate a meaningful name
 */
export const generateSampleName = (transcription: string): string => {
  if (!transcription || transcription.trim().length === 0) {
    return 'voice-sample'
  }

  // Clean and truncate transcription
  const cleaned = transcription.trim().toLowerCase()
  
  // Detect emotion/tone keywords
  const emotions: Record<string, string[]> = {
    'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love'],
    'sad': ['sad', 'cry', 'upset', 'hurt', 'pain', 'miss', 'lonely'],
    'angry': ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated'],
    'calm': ['calm', 'peace', 'relax', 'quiet', 'gentle', 'soft'],
    'worried': ['worry', 'anxious', 'nervous', 'scared', 'afraid', 'concern'],
    'comfort': ['comfort', 'okay', 'fine', 'better', 'support', 'here for you'],
    'motivation': ['can do', 'believe', 'strong', 'try', 'keep going', 'proud'],
    'greeting': ['hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you'],
    'question': ['what', 'why', 'how', 'when', 'where', 'who', '?'],
  }

  // Find matching emotion
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => cleaned.includes(keyword))) {
      return emotion
    }
  }

  // If no emotion detected, use first 3 words
  const words = transcription.trim().split(/\s+/).slice(0, 3).join('-')
  return words.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'voice-sample'
}

/**
 * Check if transcription is configured
 */
export const isTranscriptionConfigured = (): boolean => {
  return !!GROQ_API_KEY
}
