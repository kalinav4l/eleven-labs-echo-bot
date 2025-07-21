import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const buttonsRef = useRef(null);
  
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });
  const descInView = useInView(descRef, { once: true, margin: "-100px" });
  const buttonsInView = useInView(buttonsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section id="hero" className="relative py-20 pt-32 overflow-hidden min-h-screen flex items-center">
      {/* Dynamic background elements */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-gray-300/30 to-gray-400/30 rounded-full animate-pulse"></div>
        <div 
          className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-br from-gray-400/40 to-gray-500/40 rounded-full animate-pulse" 
          style={{ animationDelay: '1s' }}
        ></div>
        <div 
          className="absolute bottom-40 left-32 w-20 h-20 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full animate-pulse" 
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="space-y-8">
            <motion.h1 
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span>Creează agent </span>
              <span className="bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent animate-pulse">
                AI
              </span>
              <span> în </span>
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent animate-pulse">
                3 minute
              </span>
            </motion.h1>
            
            <motion.p 
              ref={descRef}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={descInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transformă-ți afacerea cu primul angajat digital perfect instruit.
            </motion.p>

            <motion.div 
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={buttonsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link to="/auth">
                <motion.button 
                  className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Începe Trial Gratuit
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </motion.button>
              </Link>
              <motion.button 
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                Vizualizează Demo
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}