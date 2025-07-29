import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Sample tasks data matching Notion style
  const tasks = [
    { id: 1, title: "Telefonie Terra-Vita", date: "2024-12-02" },
    { id: 2, title: "Pregatise Strategiile de conectare tale...", date: "2024-12-02" },
    { id: 3, title: "Demo apeluri Profitrello", date: "2024-12-02" },
    { id: 4, title: "Demo apeluri Ultraservice", date: "2024-12-02" },
    { id: 5, title: "Agent audio ca sa testeze cu de...", date: "2024-12-03" },
    { id: 6, title: "De restabilit conexiunile si toll cli...", date: "2024-12-03" },
    { id: 7, title: "Agent audio pentru Biliago", date: "2024-12-03" },
    { id: 8, title: "concurenti pentru ai voice calls", date: "2024-12-03" },
    { id: 9, title: "Start conectare Bicompiex Telefon...", date: "2024-12-06" },
    { id: 10, title: "De facut functionlitati ai automat...", date: "2024-12-08" },
    { id: 11, title: "De facut cont demo pentru...", date: "2024-12-08" },
    { id: 12, title: "Inregistrare pentru affiliate prog...", date: "2024-12-08" },
    { id: 13, title: "Markus, avem nevole de conturi...", date: "2024-12-08" },
    { id: 14, title: "Automatizator de postari...", date: "2024-12-08" },
    { id: 15, title: "Markus, deci este Prompiuul desp...", date: "2024-12-08" },
    { id: 16, title: "demo Apeluri Credite pentru toti", date: "2024-12-13" },
    { id: 17, title: "Scrapping ultraservice", date: "2024-12-14" },
    { id: 18, title: "Preing Telegram channels (news) to extract content ideas", date: "2024-12-14" },
    { id: 19, title: "De implementat cea soluti pe kalina...", date: "2024-12-15" },
    { id: 20, title: "Revolute si identificarea integra...", date: "2024-12-15" },
    { id: 21, title: "Markus, adauga te rog si la noi turnii...", date: "2024-12-15" },
    { id: 22, title: "Avem nevol urgent de vocea la biruri...", date: "2024-12-15" },
    { id: 23, title: "Pentru cand putem conecta protectii...", date: "2024-12-15" },
    { id: 24, title: "Urgent automatizare pentru Bi", date: "2024-12-20" },
    { id: 25, title: "Este necesar de creat primi agenti d...", date: "2024-12-21" },
    { id: 26, title: "Este necesar de inceput crearea age...", date: "2024-12-21" },
    { id: 27, title: "Markus, urgent Trebule de dubl...", date: "2024-12-21" },
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getTasksForDate = (day: number) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <DashboardLayout>
      <div className="flex-1 bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center px-2">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm text-gray-600 hover:bg-gray-100">
              Today
            </Button>
            <Button variant="ghost" size="sm" className="text-sm text-gray-600 hover:bg-gray-100">
              Calendar Deadlines
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              New
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-0">
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-gray-50 border-r border-b border-gray-200 px-3 py-2">
                <span className="text-xs font-medium text-gray-600 uppercase">{day}</span>
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayTasks = getTasksForDate(day);
              const isToday = day && 
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === 
                new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className="bg-white border-r border-b border-gray-200 min-h-[140px] p-1 relative"
                >
                  {day && (
                    <>
                      <div className={`text-xs mb-1 px-1 pt-1 ${
                        isToday ? 'text-red-600 font-semibold' : 'text-gray-400'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayTasks.map((task, taskIndex) => (
                          <div
                            key={task.id}
                            className="bg-white border border-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded text-left cursor-pointer hover:bg-gray-50"
                            style={{
                              fontSize: '11px',
                              lineHeight: '14px',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 flex-shrink-0"></span>
                            {task.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;