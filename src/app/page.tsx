import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { FeatureSection } from '@/components/FeatureSection'
import { Demo } from '@/components/sections/Demo'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { TrustedBy } from '@/components/sections/TrustedBy'
import { FAQ } from '@/components/sections/FAQ'
import { CTA } from '@/components/sections/CTA'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingCards } from '@/components/three/FloatingCards'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-300/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Floating 3D Cards */}
        <FloatingCards />
        
        {/* Navigation */}
        <Header />
        
        {/* Main Content */}
        <main>
          <Hero />
          <TrustedBy />
          <Features />
          
          {/* Four new feature sections */}
          <FeatureSection 
            title="Instant Voice Cloning"
            body="Revolutionary AI technology that captures and replicates voice patterns in real-time, enabling personalized communication experiences with unprecedented accuracy and natural sound quality."
            imgSrc="/assets/voice-clone.png"
            imgAlt="Voice cloning technology illustration"
          />
          
          <FeatureSection 
            title="Multimodal Search"
            body="Advanced search capabilities that understand voice, text, and visual inputs simultaneously, providing intelligent results across all communication channels with contextual understanding."
            imgSrc="/assets/multimodal-search.png"
            imgAlt="Multimodal search interface"
          />
          
          <FeatureSection 
            title="Edge-Ready Deployment"
            body="Optimized for edge computing environments with automatic scaling, minimal latency, and seamless integration across distributed networks for maximum performance and reliability."
            imgSrc="/assets/edge-deploy.png"
            imgAlt="Edge deployment architecture diagram"
          />
          
          <FeatureSection 
            title="Private Knowledge Vaults"
            body="Secure, encrypted storage solutions that keep your sensitive communications and data completely private while enabling intelligent search and retrieval across your organization."
            imgSrc="/assets/knowledge-vault.png"
            imgAlt="Private knowledge vault security interface"
          />
          
          <Demo />
          <HowItWorks />
          <FAQ />
          <CTA />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </SmoothScrollProvider>
  )
}
