import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Mic, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  Sparkles,
  Calendar,
  Mail,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const quickActions = [
    {
      icon: MessageCircle,
      title: 'Start Chat',
      description: 'Have a conversation with your AI assistant',
      color: 'cyan',
      path: '/chat'
    },
    {
      icon: Mic,
      title: 'Voice Samples',
      description: 'Record family voice samples for personalization',
      color: 'purple',
      path: '/voice'
    },
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your personal information',
      color: 'blue',
      path: '/profile'
    },
    {
      icon: SettingsIcon,
      title: 'Settings',
      description: 'Customize your experience',
      color: 'green',
      path: '/settings'
    }
  ]

  return (
    <div className="min-h-screen bg-black cyan-gradient-overlay" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400" style={{ color: '#06b6d4' }} />
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                Manasatchi <span className="text-cyan-400" style={{ color: '#06b6d4' }}>AI</span>
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all"
              style={{ color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Welcome back! 👋
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Ready to continue your journey with your AI companion
          </p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="elegant-card rounded-2xl p-6 mb-8"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#ffffff' }}>
            <User className="w-5 h-5 text-cyan-400" style={{ color: '#06b6d4' }} />
            Your Account
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <Mail className="w-4 h-4" style={{ color: 'rgba(6, 182, 212, 0.6)' }} />
              <span className="text-sm">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <Calendar className="w-4 h-4" style={{ color: 'rgba(6, 182, 212, 0.6)' }} />
              <span className="text-sm">Member since:</span>
              <span className="font-medium">
                {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-semibold mb-6" style={{ color: '#ffffff' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  onClick={() => navigate(action.path)}
                  className="rounded-xl p-6 text-left hover:bg-slate-800/60 group transition-all border border-slate-700/50"
                  style={{ backgroundColor: 'rgb(30, 41, 59)' }}
                >
                  <Icon className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" style={{ color: '#06b6d4' }} />
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors" style={{ color: '#ffffff' }}>
                    {action.title}
                  </h4>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {action.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#06b6d4' }}>
                    <span>Open</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-cyan rounded-2xl p-6 border-l-4"
          style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)', borderLeft: '4px solid #06b6d4' }}
        >
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: '#ffffff' }}>
            🚀 Getting Started
          </h3>
          <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Welcome to your personalized voice assistant! Here's what you can do:
          </p>
          <ol className="space-y-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: '#06b6d4' }}>1.</span>
              <span>Complete your profile with personal information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: '#06b6d4' }}>2.</span>
              <span>Set your language and voice preferences</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: '#06b6d4' }}>3.</span>
              <span>Start chatting with your AI assistant</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: '#06b6d4' }}>4.</span>
              <span>Record family voice samples (coming soon)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: '#06b6d4' }}>5.</span>
              <span>Enable voice cloning for personalized responses (coming soon)</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  )
}
