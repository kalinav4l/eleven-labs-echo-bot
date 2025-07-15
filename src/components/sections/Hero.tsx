export function Hero() {
  return (
    <section id="hero" className="relative section-padding pt-32 overflow-hidden">
      <div className="container-width">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-400">
                <span className="text-brand-300">⚡</span>
                Ultra-low latency AI calls
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-brand-400 leading-tight">
                Crystal-clear{' '}
                <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                  AI calls
                </span>
                {' '}anywhere
              </h1>
              
              <p className="text-xl text-brand-300 max-w-xl leading-relaxed">
                Experience ultra-low latency voice calls with AI-enhanced quality, 
                end-to-end encryption, and global coverage for seamless communication.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary flex items-center gap-2 group">
                Start Free Trial
                <span>→</span>
              </button>
              
              <button className="btn-secondary flex items-center gap-2 group">
                <span>▶</span>
                Watch Demo
              </button>
            </div>

            {/* Features preview */}
            <div className="flex flex-wrap gap-6 pt-8">
              <div className="flex items-center gap-2 text-sm text-brand-300">
                <span className="text-success-400">🛡️</span>
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-300">
                <span className="text-accent-400">⚡</span>
                Sub-100ms latency
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-300">
                <div className="w-2 h-2 bg-success-400 rounded-full" />
                99.9% uptime
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative">
              {/* Main visual placeholder */}
              <div className="relative glass rounded-3xl p-8 h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-brand-200 to-brand-400 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-4xl text-brand-100">▶</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-100">Live Demo</h3>
                  <p className="text-brand-300">Interactive call experience</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm text-brand-100">
                  <div className="w-2 h-2 bg-success-400 rounded-full" />
                  Active: 1.2M users
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4">
                <div className="text-sm text-brand-100">
                  <div className="font-semibold">Global Coverage</div>
                  <div className="text-brand-300">120+ countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
