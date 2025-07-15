export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-neutral-200/10">
      <div className="container-width">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-brand-100">
            Kalina AI
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-brand-300 hover:text-brand-100">
              Features
            </a>
            <a href="#demo" className="text-brand-300 hover:text-brand-100">
              Demo
            </a>
            <a href="#how-it-works" className="text-brand-300 hover:text-brand-100">
              How it Works
            </a>
            <a href="#pricing" className="text-brand-300 hover:text-brand-100">
              Pricing
            </a>
          </nav>
          
          <button className="btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
