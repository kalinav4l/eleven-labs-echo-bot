
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Settings, Phone } from 'lucide-react';

const KalinaAgents = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenții Kalina</h1>
            <p className="text-muted-foreground">Gestionează agenții tăi AI pentru diverse scenarii</p>
          </div>
          <Button className="glass-button">
            <Plus className="w-4 h-4 mr-2" />
            Agent Nou
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Agent Demo */}
          <Card className="liquid-glass animate-fade-in hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Agent Vânzări</CardTitle>
                    <p className="text-sm text-muted-foreground">Activ</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="glass-button border-border">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Agent specializat în prospectarea clienților și prezentarea ofertelor comerciale.
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Apeluri:</span>
                    <p className="font-semibold text-foreground">127</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Succes:</span>
                    <p className="font-semibold text-accent">23%</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 glass-button">
                    <Phone className="w-4 h-4 mr-2" />
                    Test Apel
                  </Button>
                  <Button variant="outline" size="sm" className="glass-button border-border">
                    Editează
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Suport */}
          <Card className="liquid-glass animate-fade-in hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Agent Suport</CardTitle>
                    <p className="text-sm text-muted-foreground">Activ</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="glass-button border-border">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Agent pentru asistență tehnică și rezolvarea problemelor clienților.
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Apeluri:</span>
                    <p className="font-semibold text-foreground">89</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Satisfacție:</span>
                    <p className="font-semibold text-accent">94%</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 glass-button">
                    <Phone className="w-4 h-4 mr-2" />
                    Test Apel
                  </Button>
                  <Button variant="outline" size="sm" className="glass-button border-border">
                    Editează
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder pentru agent nou */}
          <Card className="liquid-glass animate-fade-in hover:shadow-lg transition-all border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Creează Agent Nou</h3>
                <p className="text-sm text-muted-foreground">Adaugă un nou agent AI pentru echipa ta</p>
              </div>
              <Button className="glass-button">
                Începe Acum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KalinaAgents;
