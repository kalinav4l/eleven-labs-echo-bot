
import React from 'react';

const WidgetDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo Widget Vocal Borea AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Testează widget-ul de apel vocal pe această pagină
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cod pentru integrare:</h2>
            <div className="bg-gray-100 p-4 rounded border font-mono text-sm text-left">
              {`<script src="${window.location.origin}/widget.js" async></script>`}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Caracteristici:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Widget vocal plutitor în colțul dreapta-jos</li>
              <li>✅ Apel vocal real-time cu Borea AI</li>
              <li>✅ Interfață modernă și intuitivă</li>
              <li>✅ Integrare cu ElevenLabs Conversational AI</li>
              <li>✅ Detectare automată a vocii</li>
              <li>✅ Fără dependințe externe</li>
              <li>✅ Funcționează pe orice domeniu</li>
              <li>✅ Animații vizuale pentru interacțiune</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Cum să folosești:</h3>
            <ol className="space-y-2 text-gray-600">
              <li>1. Copiază codul JavaScript</li>
              <li>2. Adaugă-l în HTML-ul site-ului tău</li>
              <li>3. Apasă butonul de apel pentru a începe</li>
              <li>4. Permite accesul la microfon când se solicită</li>
              <li>5. Vorbește natural cu Borea AI</li>
              <li>6. Ascultă răspunsurile vocale ale asistentului</li>
            </ol>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Instrucțiuni de testare:</h3>
            <div className="text-left space-y-2 text-gray-600">
              <p>📞 <strong>Inițierea apelului:</strong> Apasă butonul circular din colțul dreapta-jos</p>
              <p>🎤 <strong>Permisiuni:</strong> Acceptă accesul la microfon când se solicită</p>
              <p>🗣️ <strong>Conversația:</strong> Vorbește natural și așteaptă răspunsul lui Borea AI</p>
              <p>🔴 <strong>Închiderea:</strong> Apasă "Închide" pentru a termina apelul</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Widget-ul vocal ar trebui să apară în colțul dreapta-jos al acestei pagini.
          </p>
          <p className="text-sm text-gray-500">
            Dacă nu îl vezi, verifică consola pentru erori sau refresh pagina.
          </p>
        </div>
      </div>

      {/* Încarcă widget-ul pentru demonstrație */}
      <script src="/widget.js" async></script>
    </div>
  );
};

export default WidgetDemo;
