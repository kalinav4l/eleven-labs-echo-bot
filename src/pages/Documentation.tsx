import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bot, Phone, BarChart3, Calendar, Globe, Mail, FileText, Settings } from 'lucide-react';

const Documentation = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentație Kalina AI</h1>
          <p className="text-gray-600">Ghidul complet pentru utilizarea platformei de asistenți AI vocali</p>
        </div>

        <div className="grid gap-6">
          {/* Introducere */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Ce este Kalina AI?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Kalina AI este o platformă completă pentru crearea și gestionarea asistenților vocali inteligenti. 
                Poți construi agenți AI care pot vorbi cu clienții tăi prin telefon, pot răspunde la întrebări, 
                pot programa întâlniri și pot efectua diverse sarcini automate.
              </p>
              <p>
                Platforma oferă instrumente pentru a crea, testa, monitoriza și optimiza asistenții tăi vocali, 
                totul într-o interfață simplă și intuitivă.
              </p>
            </CardContent>
          </Card>

          {/* Agenți AI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agenți AI
              </CardTitle>
              <CardDescription>Crearea și gestionarea asistenților vocali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cum să creezi un agent nou:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Mergi la secțiunea "Agents" din meniu</li>
                  <li>Apasă butonul "Create New Agent"</li>
                  <li>Completează numele și descrierea agentului</li>
                  <li>Alege vocea dorită din lista disponibilă</li>
                  <li>Scrie instrucțiunile de sistem (System Prompt) - acestea definesc comportamentul agentului</li>
                  <li>Salvează și testează agentul</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Configurarea agentului:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><strong>System Prompt:</strong> Instrucțiunile principale care definesc personalitatea și scopul agentului</li>
                  <li><strong>First Message:</strong> Primul mesaj pe care îl va spune agentul când începe conversația</li>
                  <li><strong>Voice:</strong> Vocea cu care va vorbi agentul - poți alege din diverse opțiuni</li>
                  <li><strong>Language:</strong> Limba în care va vorbi agentul</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Apeluri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Apeluri
              </CardTitle>
              <CardDescription>Inițierea și gestionarea apelurilor telefonice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Apeluri individuale:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Mergi la secțiunea "Calls" din meniu</li>
                  <li>Selectează tab-ul "Single Call"</li>
                  <li>Alege agentul pe care vrei să-l folosești</li>
                  <li>Introdu numărul de telefon al destinatarului</li>
                  <li>Apasă "Start Call" pentru a iniția apelul</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Apeluri în serie (Batch):</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Selectează tab-ul "Batch"</li>
                  <li>Încarcă un fișier CSV cu lista de contacte</li>
                  <li>Mapează coloanele din CSV (nume, telefon, etc.)</li>
                  <li>Configurează programarea apelurilor</li>
                  <li>Pornește campania de apeluri</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Istoricul apelurilor:</h4>
                <p className="text-sm text-gray-600">
                  În tab-ul "History" poți vedea toate apelurile efectuate, durata lor, 
                  costurile și poți asculta înregistrările conversațiilor.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>Monitorizarea performanțelor și analizele conversațiilor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Ce poți analiza:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><strong>Metrics:</strong> Statistici generale (numărul de apeluri, durata medie, rata de succes)</li>
                  <li><strong>Conversations:</strong> Analiză detaliată a fiecărei conversații</li>
                  <li><strong>Sentiment:</strong> Analiza sentimentului clienților în timpul conversațiilor</li>
                  <li><strong>Keywords:</strong> Cuvintele cheie cele mai frecvente în conversații</li>
                  <li><strong>Performance:</strong> Performanța fiecărui agent în parte</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cum să folosești analytics:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Mergi la secțiunea "Analytics"</li>
                  <li>Alege perioada de timp pentru analiză</li>
                  <li>Filtrează după agent sau tip de conversație</li>
                  <li>Analizează rapoartele generate</li>
                  <li>Exportă datele pentru analize suplimentare</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar
              </CardTitle>
              <CardDescription>Programarea apelurilor și gestionarea întâlnirilor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Programarea apelurilor:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Deschide calendarul din meniul principal</li>
                  <li>Selectează data și ora dorită</li>
                  <li>Alege agentul care va efectua apelul</li>
                  <li>Adaugă detalii despre client și scopul apelului</li>
                  <li>Salvează programarea</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Gestionarea programărilor:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Vezi toate apelurile programate în vizualizarea de calendar</li>
                  <li>Modifică sau anulează programările existente</li>
                  <li>Primește notificări înainte de apeluri</li>
                  <li>Sincronizează cu calendarul tău personal</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Scraping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Web Scraping
              </CardTitle>
              <CardDescription>Extragerea automată de date din website-uri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cum să extragi date:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Mergi la secțiunea "Scraping"</li>
                  <li>Introdu URL-ul website-ului de unde vrei să extragi date</li>
                  <li>Alege tipul de date pe care le vrei (produse, contacte, articole)</li>
                  <li>Configurează parametrii de extragere</li>
                  <li>Pornește procesul de scraping</li>
                  <li>Descarcă rezultatele în format CSV sau JSON</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tipuri de date disponibile:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Informații de contact (nume, telefon, email)</li>
                  <li>Produse și prețuri</li>
                  <li>Articole și conținut</li>
                  <li>Imagini și media</li>
                  <li>Link-uri și structura site-ului</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Gmail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Integrare Gmail
              </CardTitle>
              <CardDescription>Conectarea cu Gmail pentru automatizări email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Configurarea Gmail:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Mergi la secțiunea "Gmail"</li>
                  <li>Conectează-ți contul Gmail folosind OAuth</li>
                  <li>Acordă permisiunile necesare</li>
                  <li>Configurează regulile de automatizare</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Funcționalități disponibile:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Citirea automată a email-urilor noi</li>
                  <li>Trimiterea de răspunsuri automate</li>
                  <li>Extragerea informațiilor din atașamente</li>
                  <li>Organizarea email-urilor pe categorii</li>
                  <li>Sincronizarea cu CRM-ul tău</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Transcripts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcripturi
              </CardTitle>
              <CardDescription>Procesarea și analiza înregistrărilor audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Încărcarea fișierelor audio:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Mergi la secțiunea "Transcripts"</li>
                  <li>Încarcă fișierul audio (MP3, WAV, M4A)</li>
                  <li>Alege limba pentru transcripție</li>
                  <li>Pornește procesul de transcripție</li>
                  <li>Primești transcriptul text automat</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Funcționalități avansate:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Identificarea vorbitorilor (speaker identification)</li>
                  <li>Marcarea timpului pentru fiecare frază</li>
                  <li>Analiza sentimentului</li>
                  <li>Extragerea informațiilor cheie</li>
                  <li>Export în multiple formate</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setări și Configurări
              </CardTitle>
              <CardDescription>Personalizarea platformei și gestionarea contului</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Setări cont:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Modificarea informațiilor de profil</li>
                  <li>Schimbarea parolei</li>
                  <li>Configurarea notificărilor</li>
                  <li>Gestionarea facturării și creditelor</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Setări agenți:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Configurații globale pentru toți agenții</li>
                  <li>Setarea limitelor de cost</li>
                  <li>Configurarea backup-urilor</li>
                  <li>Integrări externe</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Consilii */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Consilii pentru utilizare optimă</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Pentru agenți mai buni:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Scrie instrucțiuni clare și specifice în System Prompt</li>
                  <li>Testează agentul cu scenarii diverse înainte de a-l pune în producție</li>
                  <li>Monitorizează performanțele în Analytics și optimizează periodic</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Pentru rezultate mai bune:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Folosește date de calitate pentru training și scraping</li>
                  <li>Segmentează clienții pentru mesaje personalizate</li>
                  <li>Analizează feedback-ul și ajustează strategia</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;