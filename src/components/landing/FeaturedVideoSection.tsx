import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FeaturedVideoSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()

  return (
    <section
      ref={ref}
      className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.9 }}
        className="max-w-6xl mx-auto rounded-3xl overflow-hidden aspect-video relative"
      >
        <video
          className="w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* Left card */}
            <div className="elegant-card rounded-2xl p-6 md:p-8 max-w-md hover-glow">
              <div className="text-cyan-400 text-xs tracking-widest uppercase mb-3">
                Our Approach
              </div>
              <p className="text-white text-sm md:text-base leading-relaxed">
                We believe in the power of emotional connection through technology. Every voice clone
                is crafted with care, preserving the unique characteristics that make your loved ones special.
              </p>
            </div>

            {/* Right button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="btn-cyan-glow rounded-full px-8 py-3 text-white text-sm font-medium relative z-10"
            >
              Explore more
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
