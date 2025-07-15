export function CTA() {
  return (
    <section className="section-padding">
      <div className="container-width">
        <div className="glass rounded-3xl p-12 lg:p-20 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6">
            Ready to Transform Your Communications?
          </h2>
          <p className="text-xl text-brand-300 mb-8 max-w-3xl mx-auto">
            Join thousands of companies already using Kalina AI for crystal-clear, 
            secure, and ultra-fast voice communications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Contact Sales
            </button>
          </div>
          
          <p className="text-sm text-brand-300 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
