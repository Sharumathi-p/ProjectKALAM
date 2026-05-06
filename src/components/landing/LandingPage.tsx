import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Globe, ArrowRight, MessageCircle, Share2, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [email, setEmail] = useState('')

  // Video fade logic
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let fadeAnimation: number | null = null

    const animateOpacity = (
      from: number,
      to: number,
      duration: number,
      callback?: () => void
    ) => {
      const startTime = performance.now()
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        video.style.opacity = String(from + (to - from) * progress)

        if (progress < 1) {
          fadeAnimation = requestAnimationFrame(animate)
        } else if (callback) {
          callback()
        }
      }
      fadeAnimation = requestAnimationFrame(animate)
    }

    const handleCanPlay = () => {
      video.play()
      animateOpacity(0, 1, 500)
    }

    const handleTimeUpdate = () => {
      if (video.duration - video.currentTime <= 0.55) {
        if (fadeAnimation) cancelAnimationFrame(fadeAnimation)
        animateOpacity(parseFloat(video.style.opacity) || 1, 0, 500)
      }
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play()
        animateOpacity(0, 1, 500)
      }, 100)
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      if (fadeAnimation) cancelAnimationFrame(fadeAnimation)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/register', { state: { email } })
    }
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex flex-col">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        muted
        autoPlay
        playsInline
        preload="auto"
        style={{ opacity: 0 }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
      />

      {/* Navbar */}
      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-white" />
              <span className="text-white font-semibold text-lg">Manasatchi AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href="#features" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                About
              </a>
              <a href="#services" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Services
              </a>
            </div>
          </div>

          {/* Right side - conditional based on auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="btn-cyan-glow rounded-full px-6 py-2 text-white text-sm font-medium relative z-10"
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-cyan-glow rounded-full px-6 py-2 text-white text-sm font-medium relative z-10"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap mb-12 font-instrument"
        >
          Know it <em className="italic text-cyan-glow">all</em>
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onSubmit={handleEmailSubmit}
          className="max-w-xl w-full mb-6"
        >
          <div className="glass-cyan rounded-full pl-6 pr-2 py-2 flex items-center gap-3 hover-glow">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-base"
              required
            />
            <button
              type="submit"
              className="btn-cyan-glow rounded-full p-3 text-white hover:scale-105 transition-transform relative z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/70 text-sm leading-relaxed px-4 mb-8 max-w-2xl"
        >
          Your compassionate AI companion with personalized family voices for emotional support.
          Experience the future of AI-powered conversations with voice cloning technology.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={() => navigate(user ? '/dashboard' : '/register')}
          className="btn-cyan-glow rounded-full px-8 py-3 text-white text-sm font-medium relative z-10"
        >
          {user ? 'Go to Dashboard' : 'Get Started'}
        </motion.button>
      </div>

      {/* Social Icons Footer */}
      <div className="relative z-10 flex justify-center gap-4 pb-12">
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          href="#"
          className="glass-cyan rounded-full p-4 text-cyan-400 hover:text-cyan-300 hover-glow transition-all"
        >
          <MessageCircle className="w-5 h-5" />
        </motion.a>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          href="#"
          className="glass-cyan rounded-full p-4 text-cyan-400 hover:text-cyan-300 hover-glow transition-all"
        >
          <Share2 className="w-5 h-5" />
        </motion.a>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          href="#"
          className="glass-cyan rounded-full p-4 text-cyan-400 hover:text-cyan-300 hover-glow transition-all"
        >
          <Globe className="w-5 h-5" />
        </motion.a>
      </div>
    </div>
  )
}
