
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TextPressure from '@/components/TextPressure';
import { Bot, BarChart3, PhoneCall, Play, CheckCircle, Star, ArrowRight, Users, Zap, Shield, Cloud, UserCheck } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
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
              <Button className="bg-[#840000] hover:bg-[#6b0000] text-white rounded-full px-6 font-semibold" onClick={handleSignUpClick}>
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
              className="bg-red-500 hover:bg-red-400 text-gray-900 px-12 py-6 text-xl rounded-full font-bold shadow-2xl hover:shadow-red-500/25 transition-all duration-300"
            >
              Explorează Soluțiile
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Soluții Complete pentru Nevoile Tale
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Service Card 1 */}
            <motion.div variants={fadeInUp}>
              <Card className="group p-8 h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#840000]/10 rounded-full flex items-center justify-center group-hover:bg-[#840000]/20 transition-colors duration-300">
                    <Cloud className="w-8 h-8 text-[#840000]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Conectivitate Avansată</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Infrastructură de rețea globală care asigură viteză și performanță maximă.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div variants={fadeInUp}>
              <Card className="group p-8 h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Securitate Cibernetică</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Protecție multi-stratificată pentru datele și operațiunile tale critice.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Card 3 */}
            <motion.div variants={fadeInUp}>
              <Card className="group p-8 h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                    <UserCheck className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Comunicații Unificate</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Soluții de voce, video și colaborare care unifică echipele, oriunde s-ar afla.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Visual Narrative Section with Sticky Scroll */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Row 1: Image Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div 
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-2xl">
                <p className="text-gray-600 font-medium text-center px-8">
                  Placeholder pentru Imagine<br />
                  (Format 3:2)
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-gray-900">Viteză Fără Compromisuri</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Infrastructura noastră de ultimă generație asigură latență minimă și performanță constantă, 
                permițându-vă să operați la capacitate maximă.
              </p>
            </motion.div>
          </div>

          {/* Row 2: Text Left, Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div 
              className="space-y-6 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-gray-900">Construit pentru Scalabilitate</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Fie că ești un startup sau o corporație, soluțiile noastre cresc odată cu afacerea ta, 
                oferind flexibilitatea de care ai nevoie.
              </p>
            </motion.div>
            <motion.div 
              className="lg:sticky lg:top-24 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-2xl">
                <p className="text-gray-600 font-medium text-center px-8">
                  Placeholder pentru Imagine<br />
                  (Format 3:2)
                </p>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Image Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-2xl">
                <p className="text-gray-600 font-medium text-center px-8">
                  Placeholder pentru Imagine<br />
                  (Format 3:2)
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-gray-900">Suport Dedicat, 24/7</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Echipa noastră de experți este mereu disponibilă pentru a oferi asistență proactivă 
                și a asigura continuitatea serviciilor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-gradient-to-r from-[#840000]/5 to-purple-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 leading-relaxed italic">
              "Colaborarea cu KALINA ne-a transformat complet infrastructura. 
              Nivelul de suport și fiabilitatea serviciilor sunt excepționale."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#840000] to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">AP</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-xl">Andrei Popescu</p>
                <p className="text-gray-600">CEO @ Tech Innovators</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Gata să duci comunicarea la nivelul următor?
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Hai să discutăm despre cum KALINA poate ajuta afacerea ta.
            </p>
            <Button 
              size="lg"
              className="bg-[#840000] hover:bg-[#6b0000] text-white px-12 py-6 text-xl rounded-full font-bold shadow-2xl hover:shadow-[#840000]/25 transition-all duration-300"
            >
              Contactează-ne Acum
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img alt="Kalina AI Logo" className="h-8 w-auto" src="/lovable-uploads/b4598fa6-e9e2-4058-bb5f-62e79ea68676.png" />
                <span className="text-xl font-bold">KALINA</span>
              </div>
              <p className="text-gray-400">Tehnologia care conectează viitorul</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600 transition-colors cursor-pointer"></div>
                <div className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600 transition-colors cursor-pointer"></div>
                <div className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600 transition-colors cursor-pointer"></div>
              </div>
            </div>

            {/* Solutions Column */}
            <div>
              <h4 className="font-bold text-lg mb-4">Soluții</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conectivitate Avansată</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Securitate Cibernetică</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Comunicații Unificate</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Servicii Cloud</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-bold text-lg mb-4">Companie</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Despre Noi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cariere</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Știri</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-bold text-lg mb-4">Resurse</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Studii de Caz</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centru de Ajutor</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentație</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400">© 2025 KALINA. Toate drepturile rezervate.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Termeni și Condiții</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Politică de Confidențialitate</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
