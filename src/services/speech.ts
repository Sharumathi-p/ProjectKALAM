/**
 * Text-to-Speech Service using Web Speech API
 */

export class TextToSpeechService {
  private synth: SpeechSynthesis

  constructor() {
    this.synth = window.speechSynthesis
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices()
  }

  /**
   * Get the best available voice (most natural sounding)
   */
  getBestVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    
    // Priority order for natural-sounding voices
    const preferredVoices = [
      // Google voices (best quality)
      'Google US English',
      'Google UK English Female',
      'Google UK English Male',
      // Microsoft voices (good quality)
      'Microsoft Zira - English (United States)',
      'Microsoft David - English (United States)',
      'Microsoft Mark - English (United States)',
      // Apple voices (Mac/iOS)
      'Samantha',
      'Alex',
      'Karen',
      // Any English voice with "natural" in the name
    ]

    // Try to find preferred voices first
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred))
      if (voice) return voice
    }

    // Fallback: Find any high-quality English voice
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('natural') || 
       v.name.toLowerCase().includes('premium') ||
       v.name.toLowerCase().includes('enhanced'))
    )
    if (englishVoice) return englishVoice

    // Last resort: Any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
  }

  /**
   * Speak text
   */
  speak(
    text: string,
    options?: {
      voice?: SpeechSynthesisVoice
      rate?: number
      pitch?: number
      volume?: number
      onEnd?: () => void
      onError?: (error: Error) => void
    }
  ): void {
    // Cancel any ongoing speech
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)

    // Use provided voice or get the best available voice
    if (options?.voice) {
      utterance.voice = options.voice
    } else {
      const bestVoice = this.getBestVoice()
      if (bestVoice) {
        utterance.voice = bestVoice
      }
    }

    // Optimize settings for more natural speech
    utterance.rate = options?.rate ?? 0.95  // Slightly slower for clarity
    utterance.pitch = options?.pitch ?? 1.0  // Natural pitch
    utterance.volume = options?.volume ?? 1.0  // Full volume

    utterance.onend = () => {
      options?.onEnd?.()
    }

    utterance.onerror = (event) => {
      options?.onError?.(new Error(event.error))
    }

    this.synth.speak(utterance)
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
  }

  /**
   * Pause speaking
   */
  pause(): void {
    if (this.synth.speaking) {
      this.synth.pause()
    }
  }

  /**
   * Resume speaking
   */
  resume(): void {
    if (this.synth.paused) {
      this.synth.resume()
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synth.paused
  }
}

/**
 * Speech-to-Text Service using Web Speech API
 */

export class SpeechToTextService {
  private recognition: any // SpeechRecognition
  private isListening: boolean = false

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser')
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
  }

  /**
   * Start listening
   */
  startListening(options: {
    language?: string
    onResult: (transcript: string, isFinal: boolean) => void
    onError?: (error: Error) => void
    onEnd?: () => void
  }): void {
    if (this.isListening) {
      return
    }

    this.recognition.lang = options.language || 'en-US'

    this.recognition.onresult = (event: any) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      const transcript = lastResult[0].transcript
      const isFinal = lastResult.isFinal

      options.onResult(transcript, isFinal)
    }

    this.recognition.onerror = (event: any) => {
      options.onError?.(new Error(event.error))
    }

    this.recognition.onend = () => {
      this.isListening = false
      options.onEnd?.()
    }

    this.recognition.start()
    this.isListening = true
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening
  }
}

/**
 * Audio Recording Service
 */

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  /**
   * Start recording
   */
  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
    } catch (error) {
      throw new Error('Failed to start recording: ' + (error as Error).message)
    }
  }

  /**
   * Stop recording and get audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Cancel recording
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.cleanup()
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
  }
}

// Export singleton instances
export const ttsService = new TextToSpeechService()
export const sttService = (() => {
  try {
    return new SpeechToTextService()
  } catch (error) {
    console.warn('Speech recognition not available:', error)
    return null
  }
})()
export const audioRecorder = new AudioRecorderService()
