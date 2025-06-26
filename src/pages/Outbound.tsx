
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Phone, Users, BarChart3 } from 'lucide-react';

const Outbound = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outbound</h1>
          <p className="text-gray-600">Gestionează apelurile și campaniile outbound</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/account/outbound/call-scheduler">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-6 w-6 text-[#0A5B4C]" />
                  <span>Calendar Apeluri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Programează și gestionează apelurile agenților cu un calendar interactiv.
                </p>
                <Button className="w-full bg-[#0A5B4C] hover:bg-[#0A5B4C]/90">
                  Deschide Calendarul
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-6 w-6 text-gray-400" />
                <span>Campanii Apeluri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Creează și gestionează campanii de apeluri în masă.
              </p>
              <Button disabled className="w-full">
                În curând
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-gray-400" />
                <span>Liste Contacte</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Importă și organizează liste de contacte pentru campaniile tale.
              </p>
              <Button disabled className="w-full">
                În curând
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-gray-400" />
                <span>Rapoarte Outbound</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Analizează performanța campaniilor și apelurilor outbound.
              </p>
              <Button disabled className="w-full">
                În curând
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Outbound;
