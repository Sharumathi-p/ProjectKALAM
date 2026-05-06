import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Languages,
  Bell,
  Mic,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'
import { getPreferences, updatePreferences } from '@services/supabase'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [language, setLanguage] = useState('en')
  const [enableNotifications, setEnableNotifications] = useState(true)
  const [enableVoiceActivation, setEnableVoiceActivation] = useState(false)
  const [wakeWord, setWakeWord] = useState('Hey Mom')

  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    setLoading(true)
    try {
      const prefs = await getPreferences(user.id)
      setLanguage(prefs.language || 'en')
      setEnableNotifications(prefs.enable_notifications ?? true)
      setEnableVoiceActivation(prefs.enable_voice_activation ?? false)
      setWakeWord(prefs.wake_word || 'Hey Mom')
    } catch (err: any) {
      console.log('Preferences not found, will create on save')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      await updatePreferences(user.id, {
        language,
        enable_notifications: enableNotifications,
        enable_voice_activation: enableVoiceActivation,
        wake_word: wakeWord,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-cyan-400" />
              <h1 className="text-lg font-semibold text-white">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
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
              className="glass-cyan rounded-lg p-4 mb-6 flex items-start gap-3 border-l-4 border-green-400"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">Settings updated successfully!</p>
            </motion.div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Preferences */}
            <div className="elegant-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-cyan-400" />
                Language Preferences
              </h3>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-white/80 mb-2">
                  Preferred Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={saving}
                  className="glass-cyan w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-black">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications */}
            <div className="elegant-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                Notifications
              </h3>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-white/80 group-hover:text-white transition-colors">
                  Enable push notifications
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                </div>
              </label>
            </div>

            {/* Voice Activation */}
            <div className="elegant-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Mic className="w-5 h-5 text-cyan-400" />
                Voice Activation
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-400 font-normal">
                  Coming Soon
                </span>
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Wake your assistant with a custom voice command
              </p>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-not-allowed opacity-50">
                  <span className="text-white/80">
                    Enable voice activation
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={enableVoiceActivation}
                      onChange={(e) => setEnableVoiceActivation(e.target.checked)}
                      disabled={true}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                  </div>
                </label>

                <div className="opacity-50">
                  <label htmlFor="wakeWord" className="block text-sm font-medium text-white/80 mb-2">
                    Wake Word
                  </label>
                  <input
                    id="wakeWord"
                    type="text"
                    value={wakeWord}
                    onChange={(e) => setWakeWord(e.target.value)}
                    disabled={true}
                    className="glass-cyan w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-white/40 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1">Feature coming soon</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="btn-cyan-glow w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
