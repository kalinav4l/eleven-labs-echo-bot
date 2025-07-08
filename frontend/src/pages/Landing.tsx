
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TextPressure from '@/components/TextPressure';
import ScrollReveal from '@/components/ScrollReveal';
import { Bot, BarChart3, PhoneCall, Play, CheckCircle, Star, ArrowRight, Users, Zap, Shield, Cloud, UserCheck, Upload, Camera } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{[key: number]: string}>({});

  const handleDemoCall = async () => {
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Demo call inițiat! Vei fi sunat în curând.');
    }, 2000);
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleSignUpClick = () => {
    navigate('/auth');
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => ({
          ...prev,
          [index]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const glassCard = "liquid-glass border border-white/20 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 liquid-glass border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img alt="Kalina AI Logo" className="h-8 w-auto" src="/lovable-uploads/b4598fa6-e9e2-4058-bb5f-62e79ea68676.png" />
              <span className="text-xl font-bold text-gray-900">KALINA</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900" onClick={handleAuthClick}>
                Autentificare
              </Button>
              <Button className="bg-[#840000] hover:bg-[#6b0000] text-white rounded-full px-6 font-semibold glass-button" onClick={handleSignUpClick}>
                Explorează Soluțiile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-gray-900 via-[#840000] to-gray-900 text-white flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#840000]/20 via-transparent to-transparent"></div>
        
        <motion.div 
          className="container mx-auto px-6 text-center relative z-10"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Animated KALINA Logo */}
          <motion.div 
            className="mb-8"
            variants={fadeInUp}
          >
            <div className="h-32 w-full flex items-center justify-center">
              <TextPressure 
                text="KALINA" 
                textColor="#FFFFFF" 
                minFontSize={80} 
                weight={true} 
                width={true} 
                italic={false} 
                scale={true} 
                className="w-full"
              />
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={fadeInUp}
          >
            Tehnologia care<br />
            <span className="text-red-400">Conectează Viitorul</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Descoperă o nouă eră a comunicării. Soluții inovatoare, securitate avansată și fiabilitate excepțională, concepute pentru a-ți propulsa afacerea.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <Button 
              size="lg"
              className="bg-red-500 hover:bg-red-400 text-gray-900 px-12 py-6 text-xl rounded-full font-bold shadow-2xl hover:shadow-red-500/25 transition-all duration-300 glass-button"
            >
              Explorează Soluțiile
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section - Enhanced with liquid glass */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#840000]/5 via-transparent to-purple-500/5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <ScrollReveal containerClassName="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Ecosistem Tehnologic de Viitor
            </ScrollReveal>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Descoperă puterea soluțiilor integrate care transformă comunicarea în experiențe de neuitat
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Service Card 1 */}
            <motion.div variants={fadeInUp}>
              <Card className={`group p-10 h-full ${glassCard} hover:-translate-y-4 hover:rotate-1 transition-all duration-700`}>
                <CardContent className="p-0 text-center">
                  <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-[#840000]/20 to-red-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <Cloud className="w-10 h-10 text-[#840000]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Conectivitate Cuantică</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Infrastructură hibridă care îmbină cloud-ul global cu edge computing pentru performanță fără precedent.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div variants={fadeInUp}>
              <Card className={`group p-10 h-full ${glassCard} hover:-translate-y-4 hover:-rotate-1 transition-all duration-700`}>
                <CardContent className="p-0 text-center">
                  <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <Shield className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Protecție Adaptivă</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Sisteme de securitate inteligente cu AI care învață și se adaptează la amenințările emergente.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Card 3 */}
            <motion.div variants={fadeInUp}>
              <Card className={`group p-10 h-full ${glassCard} hover:-translate-y-4 hover:rotate-1 transition-all duration-700`}>
                <CardContent className="p-0 text-center">
                  <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-violet-400/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <UserCheck className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Colaborare Imersivă</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Experiențe unificate care transcend granițele fizice prin realitate augmentată și comunicare holistică.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Visual Narrative Section with Image/Video Upload */}
      <section className="py-32 bg-gradient-to-b from-gray-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#840000]/3 via-transparent to-purple-500/3"></div>
        <div className="container mx-auto px-6 relative z-10">
          {/* Row 1: Image Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
            <motion.div 
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className={`aspect-[3/2] ${glassCard} rounded-3xl flex items-center justify-center relative group overflow-hidden`}>
                {uploadedImages[1] ? (
                  <img 
                    src={uploadedImages[1]} 
                    alt="Uploaded content" 
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <>
                    <div className="text-center z-10">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Încarcă Imagine sau Video<br />
                        <span className="text-sm">(Format 3:2)</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleImageUpload(1, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#840000]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ScrollReveal containerClassName="text-4xl md:text-5xl font-bold text-gray-900">
                Viteză Fără Compromisuri
              </ScrollReveal>
              <p className="text-xl text-gray-600 leading-relaxed">
                Infrastructura noastră de ultimă generație asigură latență sub-milisecundă și performanță constantă, 
                permițându-vă să operați la capacitate maximă în ecosistemul digital global.
              </p>
            </motion.div>
          </div>

          {/* Row 2: Text Left, Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
            <motion.div 
              className="space-y-8 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ScrollReveal containerClassName="text-4xl md:text-5xl font-bold text-gray-900">
                Construit pentru Infinit
              </ScrollReveal>
              <p className="text-xl text-gray-600 leading-relaxed">
                De la startup-uri până la corporații globale, arhitectura noastră elastică crește organic cu viziunea ta, 
                oferind puterea de a transforma orice idee în realitate digitală.
              </p>
            </motion.div>
            <motion.div 
              className="lg:sticky lg:top-24 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className={`aspect-[3/2] ${glassCard} rounded-3xl flex items-center justify-center relative group overflow-hidden`}>
                {uploadedImages[2] ? (
                  <img 
                    src={uploadedImages[2]} 
                    alt="Uploaded content" 
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <>
                    <div className="text-center z-10">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Încarcă Imagine sau Video<br />
                        <span className="text-sm">(Format 3:2)</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleImageUpload(2, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Image Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className={`aspect-[3/2] ${glassCard} rounded-3xl flex items-center justify-center relative group overflow-hidden`}>
                {uploadedImages[3] ? (
                  <img 
                    src={uploadedImages[3]} 
                    alt="Uploaded content" 
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <>
                    <div className="text-center z-10">
                      <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Încarcă Imagine sau Video<br />
                        <span className="text-sm">(Format 3:2)</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleImageUpload(3, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ScrollReveal containerClassName="text-4xl md:text-5xl font-bold text-gray-900">
                Parteneriat Evolutiv
              </ScrollReveal>
              <p className="text-xl text-gray-600 leading-relaxed">
                Echipa noastră de visionari tehnologici nu oferă doar suport - construim împreună viitorul comunicării, 
                anticipând nevoile de mâine încă de azi.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 bg-gradient-to-r from-[#840000]/5 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#840000]/10 via-transparent to-purple-500/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className={`max-w-5xl mx-auto text-center ${glassCard} p-16 rounded-3xl`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-3xl md:text-4xl font-medium text-gray-900 mb-12 leading-relaxed italic">
              "Colaborarea cu KALINA ne-a transformat complet viziunea asupra tehnologiei. 
              Nu doar că am câștigat o soluție - am găsit un partener pentru viitor."
            </blockquote>
            <div className="flex items-center justify-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#840000] to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-2xl">AP</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-2xl">Andrei Popescu</p>
                <p className="text-gray-600 text-lg">CEO @ Tech Innovators</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#840000]/3 via-transparent to-purple-500/3"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <ScrollReveal containerClassName="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Gata să construim viitorul împreună?
            </ScrollReveal>
            <p className="text-2xl text-gray-600 mb-16 leading-relaxed">
              Hai să transformăm viziunea ta în realitatea de mâine.
            </p>
            <Button 
              size="lg"
              className="bg-[#840000] hover:bg-[#6b0000] text-white px-16 py-8 text-2xl rounded-full font-bold shadow-2xl hover:shadow-[#840000]/25 transition-all duration-300 glass-button hover:scale-105"
            >
              Începe Transformarea
              <ArrowRight className="ml-3 h-8 w-8" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#840000]/20 via-transparent to-purple-500/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img alt="Kalina AI Logo" className="h-10 w-auto" src="/lovable-uploads/b4598fa6-e9e2-4058-bb5f-62e79ea68676.png" />
                <span className="text-2xl font-bold">KALINA</span>
              </div>
              <p className="text-gray-400 text-lg">Tehnologia care conectează viitorul</p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 liquid-glass rounded-lg hover:bg-[#840000]/20 transition-colors cursor-pointer flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <div className="w-12 h-12 liquid-glass rounded-lg hover:bg-[#840000]/20 transition-colors cursor-pointer flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <div className="w-12 h-12 liquid-glass rounded-lg hover:bg-[#840000]/20 transition-colors cursor-pointer flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>

            {/* Solutions Column */}
            <div>
              <h4 className="font-bold text-xl mb-6 text-[#840000]">Soluții</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Conectivitate Avansată</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Securitate Cibernetică</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Comunicații Unificate</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Servicii Cloud</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-bold text-xl mb-6 text-[#840000]">Companie</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Despre Noi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Cariere</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Știri</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-bold text-xl mb-6 text-[#840000]">Resurse</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Studii de Caz</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Centru de Ajutor</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg hover:text-[#840000]">Documentație</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <p className="text-gray-400 text-lg">© 2025 KALINA. Toate drepturile rezervate.</p>
              <div className="flex space-x-8">
                <a href="#" className="text-gray-400 hover:text-[#840000] transition-colors text-lg">Termeni și Condiții</a>
                <a href="#" className="text-gray-400 hover:text-[#840000] transition-colors text-lg">Politică de Confidențialitate</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
