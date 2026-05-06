import LandingPage from '@components/landing/LandingPage'
import AboutSection from '@components/landing/AboutSection'
import FeaturedVideoSection from '@components/landing/FeaturedVideoSection'
import PhilosophySection from '@components/landing/PhilosophySection'
import ServicesSection from '@components/landing/ServicesSection'

export default function Landing() {
  return (
    <div className="bg-black">
      <LandingPage />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
    </div>
  )
}
