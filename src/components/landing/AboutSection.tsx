import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="about"
      className="bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-sm tracking-widest uppercase mb-6"
        >
          About Us
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight"
        >
          <span className="block">Pioneering </span>
          <em className="font-instrument italic text-cyan-400">ideas</em>
          <span className="block md:inline"> for</span>
          <br className="hidden md:block" />
          <em className="font-instrument italic text-white/60">minds that </em>
          <em className="font-instrument italic text-cyan-400">create, build, and inspire.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 text-white/70 text-lg md:text-xl leading-relaxed max-w-3xl"
        >
          Manasatchi AI combines cutting-edge artificial intelligence with the warmth of human connection.
          Our voice cloning technology brings your loved ones' voices to life, providing comfort and
          companionship when you need it most.
        </motion.p>
      </div>
    </section>
  )
}
