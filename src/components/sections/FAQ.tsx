export function FAQ() {
  const faqs = [
    {
      question: "What is the latency of your calls?",
      answer: "Our AI-enhanced infrastructure delivers sub-100ms latency globally, ensuring real-time conversations."
    },
    {
      question: "How secure are the calls?",
      answer: "All calls use end-to-end encryption with military-grade security protocols to protect your communications."
    },
    {
      question: "What countries do you support?",
      answer: "We provide reliable coverage in 120+ countries with local infrastructure for optimal performance."
    },
    {
      question: "Can I integrate with my existing systems?",
      answer: "Yes, we offer comprehensive APIs and SDKs for seamless integration with your current infrastructure."
    }
  ]

  return (
    <section className="section-padding">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-brand-100 mb-3">
                {faq.question}
              </h3>
              <p className="text-brand-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
