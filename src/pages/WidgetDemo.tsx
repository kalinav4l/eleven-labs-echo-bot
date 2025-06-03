
import React from 'react';

const WidgetDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo Widget Chat Borea
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Testează widget-ul de chat pe această pagină
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
              <li>✅ Widget plutitor în colțul dreapta-jos</li>
              <li>✅ Interfață modernă și responsive</li>
              <li>✅ Integrare cu AI (OpenAI/ElevenLabs)</li>
              <li>✅ Fără dependințe externe</li>
              <li>✅ Funcționează pe orice domeniu</li>
              <li>✅ Auto-resize pentru textarea</li>
              <li>✅ Indicatori de typing</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Cum să folosești:</h3>
            <ol className="space-y-2 text-gray-600">
              <li>1. Copiază codul JavaScript</li>
              <li>2. Adaugă-l în HTML-ul site-ului tău</li>
              <li>3. Widget-ul va apărea automat</li>
              <li>4. Configurează agentId în widget.js</li>
              <li>5. Testează funcționalitatea</li>
            </ol>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Widget-ul ar trebui să apară în colțul dreapta-jos al acestei pagini.
          </p>
          <p className="text-sm text-gray-500">
            Dacă nu îl vezi, verifică consola pentru erori.
          </p>
        </div>
      </div>

      {/* Încarcă widget-ul pentru demonstrație */}
      <script src="/widget.js" async></script>
    </div>
  );
};

export default WidgetDemo;
