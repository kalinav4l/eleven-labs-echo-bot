export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect",
      description: "Start a call with our ultra-low latency infrastructure"
    },
    {
      number: "02", 
      title: "Enhance",
      description: "AI processes and enhances audio quality in real-time"
    },
    {
      number: "03",
      title: "Communicate", 
      description: "Enjoy crystal-clear conversations anywhere in the world"
    }
  ]

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-brand-300 max-w-3xl mx-auto">
            Simple, fast, and reliable - get started in minutes
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="glass rounded-2xl p-8 mb-6">
                <div className="text-4xl font-bold text-brand-200 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-brand-100 mb-4">
                  {step.title}
                </h3>
                <p className="text-brand-300">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-8 text-brand-200">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
