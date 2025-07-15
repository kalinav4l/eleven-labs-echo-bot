import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Bot, Phone, BarChart3, Calendar, Globe, Mail, FileText, Settings } from 'lucide-react';

const Documentation = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="elevenlabs-container elevenlabs-section">
        <div className="mb-8">
          <h1>Documentație Kalina AI</h1>
          <p>Ghidul complet pentru utilizarea platformei de asistenți AI vocali</p>
        </div>

        <div className="clean-spacing">
          {/* Introducere */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Ce este Kalina AI?
              </h2>
            </div>
            <div className="clean-spacing">
              <p>
                Kalina AI este o platformă completă pentru crearea și gestionarea asistenților vocali inteligenti. 
                Poți construi agenți AI care pot vorbi cu clienții tăi prin telefon, pot răspunde la întrebări, 
                pot programa întâlniri și pot efectua diverse sarcini automate.
              </p>
              <p>
                Platforma oferă instrumente pentru a crea, testa, monitoriza și optimiza asistenții tăi vocali, 
                totul într-o interfață simplă și intuitivă.
              </p>
            </div>
          </div>

          {/* Agenți AI */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agenți AI
              </h2>
              <p className="text-subtle">Crearea și gestionarea asistenților vocali</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Cum să creezi un agent nou:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Mergi la secțiunea "Agents" din meniu</li>
                  <li>Apasă butonul "Create New Agent"</li>
                  <li>Completează numele și descrierea agentului</li>
                  <li>Alege vocea dorită din lista disponibilă</li>
                  <li>Scrie instrucțiunile de sistem (System Prompt) - acestea definesc comportamentul agentului</li>
                  <li>Salvează și testează agentul</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Configurarea agentului:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li><span className="text-emphasis">System Prompt:</span> Instrucțiunile principale care definesc personalitatea și scopul agentului</li>
                  <li><span className="text-emphasis">First Message:</span> Primul mesaj pe care îl va spune agentul când începe conversația</li>
                  <li><span className="text-emphasis">Voice:</span> Vocea cu care va vorbi agentul - poți alege din diverse opțiuni</li>
                  <li><span className="text-emphasis">Language:</span> Limba în care va vorbi agentul</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Apeluri */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Apeluri
              </h2>
              <p className="text-subtle">Inițierea și gestionarea apelurilor telefonice</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Apeluri individuale:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Mergi la secțiunea "Calls" din meniu</li>
                  <li>Selectează tab-ul "Single Call"</li>
                  <li>Alege agentul pe care vrei să-l folosești</li>
                  <li>Introdu numărul de telefon al destinatarului</li>
                  <li>Apasă "Start Call" pentru a iniția apelul</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Apeluri în serie (Batch):</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Selectează tab-ul "Batch"</li>
                  <li>Încarcă un fișier CSV cu lista de contacte</li>
                  <li>Mapează coloanele din CSV (nume, telefon, etc.)</li>
                  <li>Configurează programarea apelurilor</li>
                  <li>Pornește campania de apeluri</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Istoricul apelurilor:</h3>
                <p className="text-subtle">
                  În tab-ul "History" poți vedea toate apelurile efectuate, durata lor, 
                  costurile și poți asculta înregistrările conversațiilor.
                </p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </h2>
              <p className="text-subtle">Monitorizarea performanțelor și analizele conversațiilor</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Ce poți analiza:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li><span className="text-emphasis">Metrics:</span> Statistici generale (numărul de apeluri, durata medie, rata de succes)</li>
                  <li><span className="text-emphasis">Conversations:</span> Analiză detaliată a fiecărei conversații</li>
                  <li><span className="text-emphasis">Sentiment:</span> Analiza sentimentului clienților în timpul conversațiilor</li>
                  <li><span className="text-emphasis">Keywords:</span> Cuvintele cheie cele mai frecvente în conversații</li>
                  <li><span className="text-emphasis">Performance:</span> Performanța fiecărui agent în parte</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2">Cum să folosești analytics:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Mergi la secțiunea "Analytics"</li>
                  <li>Alege perioada de timp pentru analiză</li>
                  <li>Filtrează după agent sau tip de conversație</li>
                  <li>Analizează rapoartele generate</li>
                  <li>Exportă datele pentru analize suplimentare</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar
              </h2>
              <p className="text-subtle">Programarea apelurilor și gestionarea întâlnirilor</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Programarea apelurilor:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Deschide calendarul din meniul principal</li>
                  <li>Selectează data și ora dorită</li>
                  <li>Alege agentul care va efectua apelul</li>
                  <li>Adaugă detalii despre client și scopul apelului</li>
                  <li>Salvează programarea</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Gestionarea programărilor:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Vezi toate apelurile programate în vizualizarea de calendar</li>
                  <li>Modifică sau anulează programările existente</li>
                  <li>Primești notificări înainte de apeluri</li>
                  <li>Sincronizează cu calendarul tău personal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Scraping */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Web Scraping
              </h2>
              <p className="text-subtle">Extragerea automată de date din website-uri</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Cum să extragi date:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Mergi la secțiunea "Scraping"</li>
                  <li>Introdu URL-ul website-ului de unde vrei să extragi date</li>
                  <li>Alege tipul de date pe care le vrei (produse, contacte, articole)</li>
                  <li>Configurează parametrii de extragere</li>
                  <li>Pornește procesul de scraping</li>
                  <li>Descarcă rezultatele în format CSV sau JSON</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Tipuri de date disponibile:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Informații de contact (nume, telefon, email)</li>
                  <li>Produse și prețuri</li>
                  <li>Articole și conținut</li>
                  <li>Imagini și media</li>
                  <li>Link-uri și structura site-ului</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Gmail */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Integrare Gmail
              </h2>
              <p className="text-subtle">Conectarea cu Gmail pentru automatizări email</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Configurarea Gmail:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Mergi la secțiunea "Gmail"</li>
                  <li>Conectează-ți contul Gmail folosind OAuth</li>
                  <li>Acordă permisiunile necesare</li>
                  <li>Configurează regulile de automatizare</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Funcționalități disponibile:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Citirea automată a email-urilor noi</li>
                  <li>Trimiterea de răspunsuri automate</li>
                  <li>Extragerea informațiilor din atașamente</li>
                  <li>Organizarea email-urilor pe categorii</li>
                  <li>Sincronizarea cu CRM-ul tău</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transcripts */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcripturi
              </h2>
              <p className="text-subtle">Procesarea și analiza înregistrărilor audio</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Încărcarea fișierelor audio:</h3>
                <ol className="list-decimal list-inside space-y-1 text-subtle">
                  <li>Mergi la secțiunea "Transcripts"</li>
                  <li>Încarcă fișierul audio (MP3, WAV, M4A)</li>
                  <li>Alege limba pentru transcripție</li>
                  <li>Pornește procesul de transcripție</li>
                  <li>Primești transcriptul text automat</li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2">Funcționalități avansate:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Identificarea vorbitorilor (speaker identification)</li>
                  <li>Marcarea timpului pentru fiecare frază</li>
                  <li>Analiza sentimentului</li>
                  <li>Extragerea informațiilor cheie</li>
                  <li>Export în multiple formate</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="elevenlabs-card">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setări și Configurări
              </h2>
              <p className="text-subtle">Personalizarea platformei și gestionarea contului</p>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-2">Setări cont:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Modificarea informațiilor de profil</li>
                  <li>Schimbarea parolei</li>
                  <li>Configurarea notificărilor</li>
                  <li>Gestionarea facturării și creditelor</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2">Setări agenți:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Configurații globale pentru toți agenții</li>
                  <li>Setarea limitelor de cost</li>
                  <li>Configurarea backup-urilor</li>
                  <li>Integrări externe</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Consilii */}
          <div className="elevenlabs-card" style={{ backgroundColor: '#f8fafc' }}>
            <div className="mb-4">
              <h2>Consilii pentru utilizare optimă</h2>
            </div>
            <div className="clean-spacing">
              <div>
                <h3 className="mb-1">Pentru agenți mai buni:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Scrie instrucțiuni clare și specifice în System Prompt</li>
                  <li>Testează agentul cu scenarii diverse înainte de a-l pune în producție</li>
                  <li>Monitorizează performanțele în Analytics și optimizează periodic</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-1">Pentru rezultate mai bune:</h3>
                <ul className="list-disc list-inside space-y-1 text-subtle">
                  <li>Folosește date de calitate pentru training și scraping</li>
                  <li>Segmentează clienții pentru mesaje personalizate</li>
                  <li>Analizează feedback-ul și ajustează strategia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;