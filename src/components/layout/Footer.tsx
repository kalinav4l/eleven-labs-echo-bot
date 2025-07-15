export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800">
      <div className="container-width section-padding">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-brand-100">
              Kalina AI
            </div>
            <p className="text-brand-300">
              Crystal-clear AI calls, anywhere in the world.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-100">Product</h3>
            <div className="space-y-2 text-brand-300">
              <div>Features</div>
              <div>Pricing</div>
              <div>Demo</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-100">Company</h3>
            <div className="space-y-2 text-brand-300">
              <div>About</div>
              <div>Careers</div>
              <div>Contact</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-100">Support</h3>
            <div className="space-y-2 text-brand-300">
              <div>Documentation</div>
              <div>Help Center</div>
              <div>Status</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-brand-300">
          <p>&copy; 2024 Kalina AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
