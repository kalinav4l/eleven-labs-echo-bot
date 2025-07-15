export function TrustedBy() {
  const companies = [
    "TechCorp", "GlobalComm", "VoiceFirst", "CallClear", "AudioMax"
  ]

  return (
    <section className="section-padding border-y border-slate-800/50">
      <div className="container-width">
        <div className="text-center mb-12">
          <p className="text-brand-300 text-sm uppercase tracking-wider">
            Trusted by industry leaders
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
          {companies.map((company, index) => (
            <div key={index} className="text-brand-300 font-semibold text-lg">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
