import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

export default function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const services = [
    {
      tag: 'Voice Technology',
      title: 'Voice Cloning & Synthesis',
      description:
        'Advanced AI-powered voice cloning that captures the unique characteristics of your loved ones. Create personalized voice experiences with emotional depth and natural intonation.',
      videoUrl:
        'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    },
    {
      tag: 'AI Companion',
      title: 'Emotional Support & Conversation',
      description:
        'Intelligent conversational AI that provides emotional support, companionship, and meaningful interactions. Available 24/7 in multiple languages with personalized responses.',
      videoUrl:
        'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
    },
  ]

  return (
    <section
      ref={ref}
      id="services"
      className="bg-black py-28 md:py-40 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-16"
        >
          <h2 className="text-3xl md:text-5xl text-white tracking-tight">
            What we do
          </h2>
          <div className="hidden md:block text-white/40 text-sm">
            Our services
          </div>
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="elegant-card rounded-3xl overflow-hidden group cursor-pointer hover-glow"
            >
              {/* Video */}
              <div className="relative aspect-video overflow-hidden">
                <video
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  src={service.videoUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-cyan-400 text-xs tracking-widest uppercase">
                    {service.tag}
                  </div>
                  <div className="glass-cyan rounded-full p-2 hover-glow">
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                <h3 className="text-white text-xl md:text-2xl mb-3 tracking-tight">
                  {service.title}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
