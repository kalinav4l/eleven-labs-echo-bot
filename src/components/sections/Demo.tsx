export function Demo() {
  return (
    <section id="demo" className="section-padding bg-primary-900/30">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6">
            Experience the Difference
          </h2>
          <p className="text-xl text-brand-300 max-w-3xl mx-auto">
            Try our interactive demo and hear the crystal-clear quality for yourself
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 lg:p-12">
            <div className="text-center space-y-8">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-200 to-brand-400 rounded-full flex items-center justify-center mx-auto">
                <div className="text-4xl text-brand-100">▶</div>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-brand-100 mb-4">
                  Interactive Call Demo
                </h3>
                <p className="text-brand-300 mb-8">
                  Experience real-time AI-enhanced voice quality with our live demo
                </p>
                
                <button className="btn-primary text-lg px-8 py-4">
                  Start Demo Call
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">{"<100ms"}</div>
                  <div className="text-brand-300">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-400">99.9%</div>
                  <div className="text-brand-300">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-400">120+</div>
                  <div className="text-brand-300">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
