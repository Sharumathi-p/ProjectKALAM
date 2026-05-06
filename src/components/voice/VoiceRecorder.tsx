import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'
import { supabase } from '@services/supabase'
import { audioRecorder } from '@services/speech'
import { createVoice, isElevenLabsConfigured } from '@services/elevenlabs'
import { transcribeAudio, generateSampleName, isTranscriptionConfigured } from '@services/transcription'

interface VoiceSample {
  id: string
  name: string
  url: string
  duration: number
  created_at: string
}

interface VoiceProfile {
  id: string
  name: string
  relationship: string
  mood_purpose: string
  voice_id: string | null
  is_active: boolean
  sample_count: number
}

export default function VoiceRecorder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [samples, setSamples] = useState<VoiceSample[]>([])
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [sampleName, setSampleName] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  // Profile form
  const [profileName, setProfileName] = useState('')
  const [profileRelationship, setProfileRelationship] = useState('mother')
  const [profileMood, setProfileMood] = useState('')
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [user])

  useEffect(() => {
    if (selectedProfile) {
      loadSamples(selectedProfile)
      // Save selected profile to localStorage
      if (user) {
        localStorage.setItem(`selectedProfile_${user.id}`, selectedProfile)
      }
    }
  }, [selectedProfile, user])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const loadProfiles = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Count samples for each profile
      const profilesWithCounts = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: files } = await supabase.storage
            .from('voice-samples')
            .list(`${user.id}/${profile.id}/`)
          
          return {
            ...profile,
            sample_count: files?.length || 0
          }
        })
      )

      setProfiles(profilesWithCounts)
      
      // Try to restore previously selected profile from localStorage
      const savedProfileId = localStorage.getItem(`selectedProfile_${user.id}`)
      if (savedProfileId && profilesWithCounts.find(p => p.id === savedProfileId)) {
        setSelectedProfile(savedProfileId)
      } else {
        // Otherwise, select first profile or active profile
        const activeProfile = profilesWithCounts.find(p => p.is_active)
        if (activeProfile) {
          setSelectedProfile(activeProfile.id)
        } else if (profilesWithCounts.length > 0) {
          setSelectedProfile(profilesWithCounts[0].id)
        }
      }
    } catch (err: any) {
      console.error('Error loading profiles:', err)
    }
  }

  const loadSamples = async (profileId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase.storage
        .from('voice-samples')
        .list(`${user.id}/${profileId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error

      const samplesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('voice-samples')
            .getPublicUrl(`${user.id}/${profileId}/${file.name}`)

          return {
            id: file.id ?? file.name,
            name: file.name,
            url: urlData.publicUrl,
            duration: 0,
            created_at: file.created_at ?? new Date().toISOString(),
          }
        })
      )

      setSamples(samplesWithUrls)
    } catch (err: any) {
      console.error('Error loading samples:', err)
      setError('Failed to load voice samples')
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      await audioRecorder.startRecording()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to start recording')
    }
  }

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      const blob = await audioRecorder.stopRecording()
      setIsRecording(false)
      
      // Auto-save with timestamp-based name (will be analyzed later)
      await saveRecordingAuto(blob)
    } catch (err: any) {
      setError(err.message || 'Failed to stop recording')
      setIsRecording(false)
    }
  }

  const saveRecordingAuto = async (blob: Blob) => {
    if (!user || !selectedProfile) return

    setLoading(true)
    setError('')

    try {
      let fileName = `voice-sample-${Date.now()}.webm`

      // Try to transcribe and generate meaningful name
      if (isTranscriptionConfigured()) {
        try {
          setSuccess('Analyzing voice content...')
          const transcription = await transcribeAudio(blob)
          console.log('Transcription:', transcription)
          
          if (transcription) {
            const generatedName = generateSampleName(transcription)
            fileName = `${generatedName}-${Date.now()}.webm`
            console.log('Generated name:', generatedName)
          }
        } catch (transcriptionError) {
          console.error('Transcription failed, using default name:', transcriptionError)
          // Continue with default filename if transcription fails
        }
      }

      const filePath = `${user.id}/${selectedProfile}/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('voice-samples')
        .upload(filePath, blob)

      if (uploadError) throw uploadError

      setSuccess('Voice sample saved successfully!')
      loadSamples(selectedProfile)
      loadProfiles() // Refresh sample counts
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save recording')
    } finally {
      setLoading(false)
    }
  }

  const playSample = (sample: VoiceSample) => {
    if (playingId === sample.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = sample.url
        audioRef.current.play()
        setPlayingId(sample.id)
        audioRef.current.onended = () => setPlayingId(null)
      }
    }
  }

  const deleteSample = async (sample: VoiceSample) => {
    if (!user || !selectedProfile) return
    if (!confirm('Are you sure you want to delete this voice sample?')) return

    try {
      const { error } = await supabase.storage
        .from('voice-samples')
        .remove([`${user.id}/${selectedProfile}/${sample.name}`])

      if (error) throw error

      setSuccess('Voice sample deleted')
      loadSamples(selectedProfile)
      loadProfiles() // Refresh sample counts
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete sample')
    }
  }

  const createVoiceModel = async () => {
    if (!selectedProfile) {
      setError('Please select a profile first')
      return
    }

    if (samples.length < 3) {
      setError('You need at least 3 voice samples to create a voice model')
      return
    }

    if (!isElevenLabsConfigured()) {
      setError('ElevenLabs API key not configured')
      return
    }

    setLoading(true)
    setError('')

    try {
      const files = await Promise.all(
        samples.slice(0, 10).map(async (sample) => {
          const response = await fetch(sample.url)
          const blob = await response.blob()
          return new File([blob], sample.name, { type: 'audio/webm' })
        })
      )

      const profile = profiles.find(p => p.id === selectedProfile)
      const voice = await createVoice(
        `${profile?.name || 'User'}'s Voice`,
        `Voice profile for ${profile?.relationship || 'custom'} - ${profile?.mood_purpose || ''}`,
        files
      )

      // Update profile with voice_id
      await supabase
        .from('voice_profiles')
        .update({ voice_id: voice.voice_id })
        .eq('id', selectedProfile)

      setSuccess('Voice model created successfully!')
      loadProfiles() // Refresh to show voice model status
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create voice model')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(webm|wav|mp3|ogg|m4a)$/i)) {
      setError('Please upload a valid audio file (webm, wav, mp3, ogg, m4a)')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
    setShowUploadDialog(true)
  }

  const saveUploadedFile = async () => {
    if (!uploadedFile || !user || !selectedProfile) return

    setLoading(true)
    setError('')

    try {
      const extension = uploadedFile.name.split('.').pop()
      let fileName = `voice-sample-${Date.now()}.${extension}`

      // Try to transcribe and generate meaningful name
      if (isTranscriptionConfigured()) {
        try {
          setSuccess('Analyzing voice content...')
          const transcription = await transcribeAudio(uploadedFile)
          console.log('Transcription:', transcription)
          
          if (transcription) {
            const generatedName = generateSampleName(transcription)
            fileName = `${generatedName}-${Date.now()}.${extension}`
            console.log('Generated name:', generatedName)
          }
        } catch (transcriptionError) {
          console.error('Transcription failed, using default name:', transcriptionError)
          // Continue with default filename if transcription fails
        }
      }

      const filePath = `${user.id}/${selectedProfile}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('voice-samples')
        .upload(filePath, uploadedFile)

      if (uploadError) throw uploadError

      setSuccess('Voice file uploaded successfully!')
      setShowUploadDialog(false)
      setUploadedFile(null)
      loadSamples(selectedProfile)
      loadProfiles() // Refresh sample counts
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user || !profileName.trim()) {
      setError('Profile name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('voice_profiles')
        .insert({
          user_id: user.id,
          name: profileName.trim(),
          relationship: profileRelationship,
          mood_purpose: profileMood.trim() || null,
          is_active: profiles.length === 0, // First profile is active by default
        })
        .select()
        .single()

      if (error) throw error

      setSuccess(`Profile "${profileName}" created successfully!`)
      setShowProfileDialog(false)
      setProfileName('')
      setProfileRelationship('mother')
      setProfileMood('')
      loadProfiles()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const deleteProfile = async (profileId: string) => {
    if (!user) return
    if (!confirm('Are you sure? This will delete the profile and all its voice samples.')) return

    setLoading(true)
    setError('')

    try {
      // Delete all samples for this profile
      const { data: files } = await supabase.storage
        .from('voice-samples')
        .list(`${user.id}/${profileId}/`)

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${profileId}/${f.name}`)
        await supabase.storage.from('voice-samples').remove(filePaths)
      }

      // Delete profile
      const { error } = await supabase
        .from('voice_profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error

      setSuccess('Profile deleted successfully')
      if (selectedProfile === profileId) {
        setSelectedProfile(null)
        setSamples([])
      }
      loadProfiles()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile')
    } finally {
      setLoading(false)
    }
  }

  const setActiveProfile = async (profileId: string) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Deactivate all profiles
      await supabase
        .from('voice_profiles')
        .update({ is_active: false })
        .eq('user_id', user.id)

      // Activate selected profile
      const { error } = await supabase
        .from('voice_profiles')
        .update({ is_active: true })
        .eq('id', profileId)

      if (error) throw error

      setSuccess('Active voice profile updated!')
      loadProfiles()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to set active profile')
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-cyan-400" />
              <h1 className="text-lg font-semibold text-white">Voice Samples</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-cyan rounded-lg p-4 mb-6 flex items-start gap-3 border-l-4 border-red-400"
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
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-cyan rounded-lg p-4 mb-6 flex items-start gap-3 border-l-4 border-green-400"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Profiles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="elegant-card rounded-2xl p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Voice Profiles ({profiles.length})
            </h2>
            <button
              onClick={() => setShowProfileDialog(true)}
              className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all"
            >
              <Upload className="w-5 h-5" />
              Create New Profile
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">
                No voice profiles yet. Create your first profile to get started!
              </p>
              <p className="text-white/40 text-sm">
                Example: Create "Mom" profile for comfort, "Dad" for motivation
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`glass-cyan rounded-xl p-5 border-2 transition-all cursor-pointer ${
                    selectedProfile === profile.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : profile.is_active
                      ? 'border-green-400/50 bg-green-400/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedProfile(profile.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getRelationshipEmoji(profile.relationship)}</span>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{profile.name}</h3>
                        <p className="text-white/60 text-sm capitalize">{profile.relationship}</p>
                      </div>
                    </div>
                    {profile.is_active && (
                      <span className="px-2 py-1 rounded-full bg-green-400/20 border border-green-400/30 text-green-400 text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>

                  {profile.mood_purpose && (
                    <p className="text-white/70 text-sm mb-3 italic">"{profile.mood_purpose}"</p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-white/60">
                        {profile.sample_count} sample{profile.sample_count !== 1 ? 's' : ''}
                      </span>
                      {profile.voice_id && (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Voice Model
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!profile.is_active && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveProfile(profile.id)
                          }}
                          className="px-3 py-1 rounded-lg text-cyan-400 text-xs transition-all bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_30px_rgba(34,211,238,0.7)]"
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProfile(profile.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-400/20 text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recording Controls - Only show if profile selected */}
        {selectedProfile && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="elegant-card rounded-2xl p-8 mb-6"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Record Voice Sample
                  {profiles.find(p => p.id === selectedProfile) && (
                    <span className="text-lg font-normal text-cyan-400">
                      for {getRelationshipEmoji(profiles.find(p => p.id === selectedProfile)!.relationship)} {profiles.find(p => p.id === selectedProfile)!.name}
                    </span>
                  )}
                </h2>
                <p className="text-white/60 text-sm">
                  Record 5-10 short phrases (5-10 seconds each) for best voice cloning results.
                  {profiles.find(p => p.id === selectedProfile)?.mood_purpose && (
                    <span className="block mt-1 text-cyan-400/80 italic">
                      Purpose: {profiles.find(p => p.id === selectedProfile)!.mood_purpose}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {!isRecording ? (
                  <>
                    <button
                      onClick={startRecording}
                      className="px-8 py-4 rounded-xl text-white font-medium flex items-center gap-3 text-lg bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all"
                    >
                      <Mic className="w-6 h-6" />
                      Start Recording
                    </button>
                    <span className="text-white/40 text-sm">or</span>
                    <label className="px-8 py-4 rounded-xl text-white font-medium flex items-center gap-3 text-lg bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] cursor-pointer transition-all">
                      <Upload className="w-6 h-6" />
                      Upload Audio File
                      <input
                        type="file"
                        accept="audio/*,.webm,.wav,.mp3,.ogg,.m4a"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <button
                      onClick={stopRecording}
                      className="px-8 py-4 rounded-xl text-white font-medium flex items-center gap-3 text-lg bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <Square className="w-6 h-6" />
                      Stop Recording
                    </button>
                    <div className="flex items-center gap-2 text-red-400 text-2xl font-bold">
                      <Clock className="w-6 h-6 animate-pulse" />
                      {formatTime(recordingTime)}
                    </div>
                  </>
                )}
              </div>

              {isRecording && (
                <div className="mt-4">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Voice Samples List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="elegant-card rounded-2xl p-8 mb-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Voice Samples ({samples.length})
                </h2>
                {samples.length >= 3 && isElevenLabsConfigured() && !profiles.find(p => p.id === selectedProfile)?.voice_id && (
                  <button
                    onClick={createVoiceModel}
                    disabled={loading}
                    className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Create Voice Model
                      </>
                    )}
                  </button>
                )}
              </div>

              {samples.length === 0 ? (
                <div className="text-center py-12">
                  <Mic className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">
                    No voice samples yet. Record your first sample above!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {samples.map((sample, index) => (
                    <motion.div
                      key={sample.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-cyan rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{sample.name}</h3>
                        <p className="text-white/40 text-sm">
                          {new Date(sample.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playSample(sample)}
                          className="p-2 rounded-lg hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-all"
                        >
                          {playingId === sample.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteSample(sample)}
                          className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-cyan rounded-2xl p-6 border-l-4 border-cyan-400"
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            Tips for Best Results
          </h3>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Create separate profiles for each family member (Mom, Dad, Sibling, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Record in a quiet environment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Speak naturally and clearly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Record 5-10 different phrases per profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Each recording should be 5-10 seconds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Use varied sentences (questions, statements, emotions)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Switch active profile in Chat based on your mood!</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Name Dialog */}
      <AnimatePresence>
        {showNameDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNameDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="elegant-card rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Save Voice Sample</h3>
              <input
                type="text"
                value={sampleName}
                onChange={(e) => setSampleName(e.target.value)}
                placeholder="e.g., Greeting, Question, Happy tone"
                autoFocus
                className="glass-cyan w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="flex-1 px-4 py-3 rounded-lg text-white border transition-all bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveRecordingAuto(new Blob())}
                  disabled={loading || !sampleName.trim()}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Creation Dialog */}
      <AnimatePresence>
        {showProfileDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProfileDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="elegant-card rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Create Voice Profile</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Profile Name *
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g., Mom, Dad, Sister"
                    autoFocus
                    className="glass-cyan w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Relationship *
                  </label>
                  <select
                    value={profileRelationship}
                    onChange={(e) => setProfileRelationship(e.target.value)}
                    className="glass-cyan w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  >
                    <option value="mother">👩 Mother</option>
                    <option value="father">👨 Father</option>
                    <option value="sister">👧 Sister</option>
                    <option value="brother">👦 Brother</option>
                    <option value="grandmother">👵 Grandmother</option>
                    <option value="grandfather">👴 Grandfather</option>
                    <option value="friend">👫 Best Friend</option>
                    <option value="partner">💑 Partner</option>
                    <option value="mentor">👨‍🏫 Mentor</option>
                    <option value="custom">🎭 Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Mood/Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileMood}
                    onChange={(e) => setProfileMood(e.target.value)}
                    placeholder="e.g., Comfort when sad, Motivation, Fun chat"
                    className="glass-cyan w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    Describe when you'd use this voice (e.g., "Comfort when sad")
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProfileDialog(false)
                    setProfileName('')
                    setProfileRelationship('mother')
                    setProfileMood('')
                  }}
                  className="flex-1 px-4 py-3 rounded-lg text-white border transition-all bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={createProfile}
                  disabled={loading || !profileName.trim()}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all"
                >
                  {loading ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Dialog */}
      <AnimatePresence>
        {showUploadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="elegant-card rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Upload Voice Sample</h3>
              
              {uploadedFile && (
                <div className="glass-cyan rounded-lg p-4 mb-4 border border-cyan-400/30">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-white/60 text-sm">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-white/70 text-sm mb-6">
                The system will automatically analyze the voice content and save it.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadDialog(false)
                    setUploadedFile(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg text-white border transition-all bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUploadedFile}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600/20 backdrop-blur-sm hover:bg-teal-600/30 border-2 border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:border-cyan-400 active:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all"
                >
                  {loading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
