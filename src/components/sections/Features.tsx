export function Features() {
  const features = [
    {
      title: "Ultra-Low Latency",
      description: "Sub-100ms latency for real-time conversations",
      icon: "⚡"
    },
    {
      title: "AI Enhancement",
      description: "Crystal-clear audio with noise cancellation",
      icon: "🎯"
    },
    {
      title: "Global Coverage",
      description: "Reliable connections in 120+ countries",
      icon: "🌍"
    },
    {
      title: "End-to-End Encryption",
      description: "Military-grade security for all calls",
      icon: "🔒"
    }
  ]

  return (
    <section id="features" className="section-padding">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-brand-300 max-w-3xl mx-auto">
            Everything you need for crystal-clear AI-powered communication
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-brand-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-brand-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
