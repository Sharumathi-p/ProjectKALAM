import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  MoreVertical,
  Loader2,
  AlertCircle,
  Sparkles,
  User as UserIcon,
  Bot
} from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'
import { supabase } from '@services/supabase'
import { sendChatMessage, getEmotionalSupportPrompt, Message as AIMessage } from '@services/openai'
import { ttsService, sttService } from '@services/speech'
import { translateText, isTranslationConfigured } from '@services/translation'
import { isElevenLabsConfigured, synthesizeSpeech, getVoices } from '@services/elevenlabs'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  translated?: string
}

export default function ChatInterface() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [error, setError] = useState('')
  const [voiceStatus, setVoiceStatus] = useState<'cloned' | 'browser' | 'none'>('none')
  const [activeVoiceProfile, setActiveVoiceProfile] = useState<{id: string, name: string, voice_id: string | null} | null>(null)
  const [allVoiceProfiles, setAllVoiceProfiles] = useState<Array<{id: string, name: string, relationship: string, voice_id: string | null, is_active: boolean}>>([])
  const [showVoiceSelector, setShowVoiceSelector] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadOrCreateConversation()
    checkVoiceStatus()
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkVoiceStatus = async () => {
    if (!user) return

    try {
      // Load all voice profiles
      const { data: profiles } = await supabase
        .from('voice_profiles')
        .select('id, name, relationship, voice_id, is_active')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (profiles) {
        setAllVoiceProfiles(profiles)
      }

      // Load active voice profile
      const { data: profile } = await supabase
        .from('voice_profiles')
        .select('id, name, voice_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      if (profile) {
        setActiveVoiceProfile(profile)
        if (profile.voice_id && isElevenLabsConfigured()) {
          setVoiceStatus('cloned')
          console.log('Using cloned voice:', profile.name)
        } else {
          setVoiceStatus('browser')
          console.log('Using browser voice for:', profile.name)
        }
      } else {
        setActiveVoiceProfile(null)
        setVoiceStatus('browser')
        console.log('No active voice profile, using browser voice')
      }
    } catch (err) {
      setActiveVoiceProfile(null)
      setVoiceStatus('browser')
      console.log('Error loading voice profile, using browser voice')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadOrCreateConversation = async () => {
    if (!user) return

    try {
      const { data: conversations, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      let convId: string

      if (conversations && conversations.length > 0) {
        convId = conversations[0].id
      } else {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: 'New Conversation',
          })
          .select()
          .single()

        if (createError) throw createError
        convId = newConv.id
      }

      setConversationId(convId)

      const { data: msgs, error: msgsError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (msgsError) throw msgsError

      setMessages(
        msgs.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))
      )
    } catch (err: any) {
      console.error('Error loading conversation:', err)
      setError('Failed to load conversation')
    }
  }

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!conversationId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (err: any) {
      console.error('Error saving message:', err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError('')
    setLoading(true)

    const userMsgId = await saveMessage('user', userMessage)
    const newUserMsg: Message = {
      id: userMsgId || Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMsg])

    try {
      let messageToSend = userMessage
      if (targetLanguage) {
        const translated = await translateText(userMessage, 'en', targetLanguage)
        messageToSend = translated.text
      }

      const aiMessages: AIMessage[] = [
        {
          role: 'system',
          content: getEmotionalSupportPrompt(user?.user_metadata?.full_name || 'User'),
        },
        ...messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: messageToSend,
        },
      ]

      const aiResponse = await sendChatMessage(aiMessages)

      let displayResponse = aiResponse
      if (targetLanguage) {
        const translated = await translateText(aiResponse, targetLanguage, 'en')
        displayResponse = translated.text
      }

      const aiMsgId = await saveMessage('assistant', aiResponse)
      const newAiMsg: Message = {
        id: aiMsgId || Date.now().toString(),
        role: 'assistant',
        content: displayResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newAiMsg])

      if (autoSpeak) {
        speakMessage(displayResponse)
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!sttService) {
      setError('Speech recognition not supported in your browser')
      return
    }

    if (isListening) {
      sttService.stopListening()
      setIsListening(false)
    } else {
      setIsListening(true)
      sttService.startListening({
        language: targetLanguage ? `${targetLanguage}-${targetLanguage.toUpperCase()}` : 'en-US',
        onResult: (transcript, isFinal) => {
          setInput(transcript)
          if (isFinal) {
            setIsListening(false)
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error)
          setError('Speech recognition failed')
          setIsListening(false)
        },
        onEnd: () => {
          setIsListening(false)
        },
      })
    }
  }

  const speakMessage = async (text: string) => {
    if (isSpeaking) {
      ttsService.stop()
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    console.log('🔊 speakMessage called')
    console.log('📋 ElevenLabs configured:', isElevenLabsConfigured())

    // Try to get active voice profile
    let userVoiceId: string | null = null
    if (user) {
      try {
        const { data: profile } = await supabase
          .from('voice_profiles')
          .select('voice_id, name')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
        
        userVoiceId = profile?.voice_id || null
        console.log('👤 Active profile:', profile?.name, 'Voice ID:', userVoiceId)
        if (userVoiceId) {
          console.log('✅ Using voice from profile:', profile.name)
        } else {
          console.log('⚠️ Profile found but no voice_id')
        }
      } catch (err) {
        console.log('⚠️ No active voice profile found:', err)
      }
    }

    // Try ElevenLabs with user's cloned voice first
    if (isElevenLabsConfigured() && userVoiceId) {
      try {
        console.log('🎤 Attempting to use cloned voice:', userVoiceId)
        console.log('📝 Text to speak:', text.substring(0, 50) + '...')
        const audioBlob = await synthesizeSpeech(text, userVoiceId)
        console.log('✅ Audio blob received, size:', audioBlob.size, 'bytes')
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          console.log('🔊 Playing cloned voice audio...')
          await audioRef.current.play()
          audioRef.current.onended = () => {
            console.log('✅ Cloned voice playback completed')
            setIsSpeaking(false)
            URL.revokeObjectURL(audioUrl)
          }
          audioRef.current.onerror = (e) => {
            console.error('❌ Cloned voice playback error:', e)
            console.log('Falling back to browser TTS')
            setIsSpeaking(false)
            URL.revokeObjectURL(audioUrl)
            // Fallback to browser TTS
            useBrowserTTS(text)
          }
        }
        return
      } catch (error) {
        console.error('❌ ElevenLabs error:', error)
        console.log('Falling back to browser TTS')
      }
    }

    // Fallback to browser TTS
    useBrowserTTS(text)
  }

  const useBrowserTTS = (text: string) => {
    ttsService.speak(text, {
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0,
      onEnd: () => setIsSpeaking(false),
      onError: (error) => {
        console.error('TTS error:', error)
        setIsSpeaking(false)
      },
    })
  }

  const switchVoiceProfile = async (profileId: string) => {
    if (!user) return

    try {
      // Update active profile in database
      await supabase
        .from('voice_profiles')
        .update({ is_active: false })
        .eq('user_id', user.id)

      await supabase
        .from('voice_profiles')
        .update({ is_active: true })
        .eq('id', profileId)

      // Reload voice status
      await checkVoiceStatus()
      setShowVoiceSelector(false)
    } catch (err) {
      console.error('Error switching voice profile:', err)
      setError('Failed to switch voice profile')
    }
  }

  const getRelationshipEmoji = (relationship: string): string => {
    const emojiMap: Record<string, string> = {
      mother: '👩',
      father: '👨',
      sister: '👧',
      brother: '👦',
      grandmother: '👵',
      grandfather: '👴',
      friend: '👫',
      partner: '💑',
      mentor: '👨‍🏫',
      custom: '🎭',
    }
    return emojiMap[relationship.toLowerCase()] || '👤'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h1 className="text-lg font-semibold text-white">Chat Assistant</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {voiceStatus === 'cloned' && activeVoiceProfile && (
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  className="px-3 py-1 rounded-full bg-green-400/20 border border-green-400/30 text-green-400 text-xs font-medium flex items-center gap-1 hover:bg-green-400/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  {activeVoiceProfile.name}'s Voice
                </button>
              )}
              {voiceStatus === 'browser' && activeVoiceProfile && (
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  className="px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-400 text-xs font-medium flex items-center gap-1 hover:bg-blue-400/30 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  {activeVoiceProfile.name} (Browser)
                </button>
              )}
              {voiceStatus === 'browser' && !activeVoiceProfile && (
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  className="px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-400 text-xs font-medium flex items-center gap-1 hover:bg-blue-400/30 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  Browser Voice
                </button>
              )}
              {targetLanguage && (
                <div className="px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 text-xs font-medium flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {targetLanguage.toUpperCase()}
                </div>
              )}
              {autoSpeak && (
                <div className="px-3 py-1 rounded-full bg-purple-400/20 border border-purple-400/30 text-purple-400 text-xs font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Auto-speak
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 elegant-card rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setAutoSpeak(!autoSpeak)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition-colors"
                    >
                      {autoSpeak ? 'Disable' : 'Enable'} Auto-speak
                    </button>
                    {isTranslationConfigured() && (
                      <button
                        onClick={() => {
                          setTargetLanguage(targetLanguage ? null : 'es')
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        {targetLanguage ? 'Disable' : 'Enable'} Translation
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate('/voice')
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition-colors border-t border-white/10"
                    >
                      Manage Voice Profiles
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-cyan rounded-lg p-4 flex items-start gap-3 border-l-4 border-red-400"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-xs text-red-400/60 hover:text-red-400 mt-1"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Voice Profile Selector */}
      <AnimatePresence>
        {showVoiceSelector && allVoiceProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4"
          >
            <div className="elegant-card rounded-xl p-4 border border-cyan-400/30">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                Select Voice Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {allVoiceProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => switchVoiceProfile(profile.id)}
                    className={`p-3 rounded-lg text-left transition-all border-2 ${
                      profile.is_active
                        ? 'bg-cyan-400/20 border-cyan-400/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-cyan-400/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getRelationshipEmoji(profile.relationship)}</span>
                      <span className="font-semibold text-sm">{profile.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {profile.voice_id ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Cloned
                        </span>
                      ) : (
                        <span className="text-blue-400 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          Browser
                        </span>
                      )}
                      {profile.is_active && (
                        <span className="text-cyan-400">• Active</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/voice')}
                className="mt-3 w-full px-4 py-2 rounded-lg text-cyan-400 text-sm hover:bg-cyan-400/10 transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Manage Voice Profiles
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="w-16 h-16 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Start a conversation! 👋
              </h3>
              <p className="text-white/60 max-w-md">
                I'm here to provide emotional support and answer your questions.
                Ask me anything!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-cyan-400/20 border border-cyan-400/30' 
                        : 'bg-purple-400/20 border border-purple-400/30'
                    }`}>
                      {message.role === 'user' ? (
                        <UserIcon className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Bot className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`relative rounded-2xl px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-cyan-400/20 border border-cyan-400/30 rounded-tr-none'
                          : 'elegant-card rounded-tl-none'
                      }`}>
                        <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => speakMessage(message.content)}
                          className="mt-3 ml-4 w-12 h-12 rounded-full bg-purple-400/20 backdrop-blur-sm border-2 border-purple-400/40 hover:bg-purple-400/30 hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] active:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center group"
                          title="Listen to this message"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-5 h-5 text-purple-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-purple-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-400/20 border border-purple-400/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="elegant-card rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-white/60 text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 glass-cyan rounded-2xl p-3 border border-white/10 focus-within:border-cyan-400/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none resize-none max-h-32"
                style={{ minHeight: '24px' }}
              />
            </div>
            {sttService && (
              <button
                onClick={handleVoiceInput}
                disabled={loading}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'glass-cyan border border-white/10 hover:border-cyan-400/50 text-white/80 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-cyan-glow p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
