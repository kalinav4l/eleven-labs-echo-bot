
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Language {
  name: string;
  percentage: number;
}

const LanguageStats = () => {
  const languages: Language[] = [
    { name: 'Romanian', percentage: 97.0 },
    { name: 'French', percentage: 2.1 },
    { name: 'English', percentage: 0.5 },
    { name: 'Russian', percentage: 0.4 }
  ];

  return (
    <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
      <CardHeader>
        <CardTitle className="text-black text-lg font-bold">Language</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {languages.map((language, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-black text-sm font-medium">{language.name}</span>
                <span className="text-gray-600 text-sm">{language.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#FFBB00] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${language.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageStats;
