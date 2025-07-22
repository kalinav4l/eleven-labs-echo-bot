import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageSquare, Phone, Settings } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      icon: MessageSquare,
      title: "Getting Started",
      color: "from-blue-500 to-cyan-500",
      faqs: [
        {
          question: "How quickly can I set up my first AI voice agent?",
          answer: "You can have your first AI voice agent up and running in under 10 minutes. Our intuitive setup wizard guides you through the process of creating, customizing, and deploying your agent without any technical knowledge required."
        },
        {
          question: "Do I need any technical experience to use Kalina AI?",
          answer: "Not at all! Kalina AI is designed for everyone, from complete beginners to technical experts. Our drag-and-drop interface, pre-built templates, and guided setup process make it easy for anyone to create sophisticated AI voice agents."
        },
        {
          question: "What's included in the free trial?",
          answer: "Your 14-day free trial includes full access to all features: unlimited agent creation, 1,000 conversation minutes, access to all 50+ languages, analytics dashboard, and customer support. No credit card required to start."
        }
      ]
    },
    {
      icon: Phone,
      title: "Features & Capabilities",
      color: "from-purple-500 to-pink-500",
      faqs: [
        {
          question: "How natural do the AI voices sound?",
          answer: "Our AI voices are virtually indistinguishable from human speech. Using advanced neural voice synthesis, we create natural-sounding conversations with proper intonation, emotion, and context awareness. You can even clone specific voices to match your brand."
        },
        {
          question: "Can the AI handle complex conversations?",
          answer: "Absolutely! Our AI agents understand context, remember conversation history, handle interruptions, and can manage complex multi-turn dialogues. They're trained on millions of conversations and continuously learn to improve their responses."
        },
        {
          question: "What languages are supported?",
          answer: "We support 50+ languages including English, Spanish, French, German, Mandarin, Japanese, Arabic, and many more. Each language includes native pronunciation, cultural context awareness, and regional dialect support."
        }
      ]
    },
    {
      icon: Settings,
      title: "Integration & Setup",
      color: "from-green-500 to-emerald-500",
      faqs: [
        {
          question: "How does Kalina AI integrate with my existing systems?",
          answer: "Kalina AI offers seamless integration with popular CRM systems (Salesforce, HubSpot), communication platforms (Slack, Teams), and business tools through our API, webhooks, and 50+ pre-built integrations."
        },
        {
          question: "Can I customize the AI's personality and responses?",
          answer: "Yes! You have complete control over your AI agent's personality, tone, knowledge base, and response patterns. Upload your own training data, set conversation flows, and fine-tune responses to match your brand voice perfectly."
        },
        {
          question: "Is my data secure and private?",
          answer: "Security is our top priority. We use enterprise-grade encryption, are SOC 2 certified, GDPR compliant, and offer private cloud deployment options. Your data never leaves your control, and we never use it to train other models."
        }
      ]
    },
    {
      icon: HelpCircle,
      title: "Pricing & Support",
      color: "from-yellow-500 to-orange-500",
      faqs: [
        {
          question: "How does pricing work?",
          answer: "We offer flexible usage-based pricing starting at $29/month for small businesses. You only pay for what you use - conversation minutes, with transparent pricing and no hidden fees. Enterprise plans include unlimited usage and dedicated support."
        },
        {
          question: "What kind of support do you provide?",
          answer: "We provide 24/7 customer support via chat, email, and phone. Plus dedicated account managers for enterprise clients, comprehensive documentation, video tutorials, and a community forum. Average response time is under 2 hours."
        },
        {
          question: "Can I cancel or change my plan anytime?",
          answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time. No contracts, no cancellation fees. If you cancel, you'll continue to have access until the end of your billing period."
        }
      ]
    }
  ];

  return (
    <section id="faq" ref={sectionRef} className="section-padding bg-white">
      <div className="container-width px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="animate-on-scroll inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-[var(--brand-300)]" />
            <span className="text-sm font-medium text-[var(--brand-400)]">Frequently Asked Questions</span>
          </div>
          
          <h2 className="animate-on-scroll stagger-1 text-4xl md:text-5xl font-bold text-gradient mb-6">
            Everything You Need to Know
          </h2>
          
          <p className="animate-on-scroll stagger-2 text-xl text-[var(--brand-300)] max-w-3xl mx-auto">
            Get answers to the most common questions about Kalina AI. Can't find what you're looking for? Our support team is here to help.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              className={`animate-on-scroll stagger-${categoryIndex + 1}`}
            >
              {/* Category Header */}
              <div className="flex items-center space-x-4 mb-8">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} p-3`}>
                  <category.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--brand-400)]">
                  {category.title}
                </h3>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {category.faqs.map((faq, faqIndex) => {
                  const itemIndex = categoryIndex * 10 + faqIndex; // Unique index across all categories
                  const isOpen = openItems.includes(itemIndex);
                  
                  return (
                    <div
                      key={faqIndex}
                      className="glass-card rounded-xl overflow-hidden transition-all duration-300 magnetic-hover"
                    >
                      <button
                        onClick={() => toggleItem(itemIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[var(--brand-100)] transition-colors"
                      >
                        <span className="text-lg font-semibold text-[var(--brand-400)] pr-4">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-[var(--brand-300)]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[var(--brand-300)]" />
                          )}
                        </div>
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen 
                            ? 'max-h-96 opacity-100' 
                            : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-4">
                          <div className="border-t border-[var(--brand-200)] pt-4">
                            <p className="text-[var(--brand-300)] leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="animate-on-scroll mt-20">
          <div className="glass-card rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[var(--brand-400)] mb-4">
              Still have questions?
            </h3>
            
            <p className="text-[var(--brand-300)] mb-6">
              Our support team is available 24/7 to help you get the most out of Kalina AI. 
              Get in touch and we'll respond within 2 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:support@kalina-ai.com"
                className="btn-primary btn-magnetic"
              >
                Contact Support
              </a>
              <button className="btn-secondary btn-magnetic">
                Schedule Demo Call
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-[var(--brand-300)]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Average response: 2 hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>24/7 availability</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="animate-on-scroll mt-12 text-center">
          <p className="text-[var(--brand-300)] mb-4">Quick links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Documentation',
              'API Reference', 
              'Video Tutorials',
              'Community Forum',
              'Status Page'
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-[var(--brand-400)] hover:text-[var(--brand-300)] underline decoration-dotted underline-offset-4 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
