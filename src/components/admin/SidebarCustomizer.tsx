import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { Settings, GripVertical, RotateCcw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface SidebarSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  icon: string;
}

const defaultSections: SidebarSection[] = [
  { id: 'dashboard', title: 'Dashboard', enabled: true, order: 0, icon: 'User' },
  { id: 'agents', title: 'Agents', enabled: true, order: 1, icon: 'Bot' },
  { id: 'analytics', title: 'Analytics', enabled: true, order: 2, icon: 'BarChart3' },
  { id: 'agent-ai', title: 'Agent AI', enabled: true, order: 3, icon: 'Bot' },
  { id: 'voice-demo', title: 'Voice Demo', enabled: true, order: 4, icon: 'Mic' },
  { id: 'calls', title: 'Calls', enabled: true, order: 5, icon: 'PhoneCall' },
  { id: 'calendar', title: 'Calendar', enabled: true, order: 6, icon: 'Calendar' },
  { id: 'phone-numbers', title: 'Phone Numbers', enabled: true, order: 7, icon: 'Phone' },
  { id: 'test-call', title: 'Test Call', enabled: true, order: 8, icon: 'Phone' },
  { id: 'callbacks', title: 'Callbacks', enabled: true, order: 9, icon: 'PhoneForwarded' },
  { id: 'transcripts', title: 'Transcripts', enabled: true, order: 10, icon: 'FileText' },
  { id: 'scraping', title: 'Scraping', enabled: true, order: 11, icon: 'Globe' },
  { id: 'gmail', title: 'Gmail', enabled: true, order: 12, icon: 'Mail' },
  { id: 'construction', title: 'Construction', enabled: true, order: 13, icon: 'Workflow' },
];

const SidebarCustomizer: React.FC = () => {
  const [sections, setSections] = useState<SidebarSection[]>(defaultSections);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadSidebarPreferences();
  }, [user]);

  const loadSidebarPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_dashboard_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.preferences && typeof data.preferences === 'object' && 'sidebar_sections' in data.preferences) {
        const savedSections = (data.preferences.sidebar_sections as unknown) as SidebarSection[];
        // Merge with defaults to handle new sections
        const mergedSections = defaultSections.map(defaultSection => {
          const savedSection = savedSections.find(s => s.id === defaultSection.id);
          return savedSection || defaultSection;
        });
        
        // Add any new sections that weren't in the saved preferences
        const newSections = defaultSections.filter(
          defaultSection => !savedSections.find(s => s.id === defaultSection.id)
        );
        
        setSections([...mergedSections, ...newSections].sort((a, b) => a.order - b.order));
      } else {
        setSections(defaultSections);
      }
    } catch (error) {
      console.error('Error loading sidebar preferences:', error);
      setSections(defaultSections);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSidebarPreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Get current preferences
      const { data: currentData } = await supabase
        .from('user_dashboard_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      const currentPreferences = (currentData?.preferences as Record<string, any>) || {};
      const updatedPreferences = {
        ...currentPreferences,
        sidebar_sections: sections
      };

      const { error } = await supabase
        .from('user_dashboard_preferences')
        .upsert({
          user_id: user.id,
          preferences: updatedPreferences as any
        });

      if (error) throw error;

      toast({
        title: "Salvat cu succes",
        description: "Preferințele sidebar-ului au fost salvate.",
      });

      // Trigger a custom event to notify the sidebar to update
      window.dispatchEvent(new CustomEvent('sidebarPreferencesUpdated', { 
        detail: sections 
      }));

    } catch (error) {
      console.error('Error saving sidebar preferences:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut salva preferințele.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedSections = Array.from(sections);
    const [removed] = reorderedSections.splice(result.source.index, 1);
    reorderedSections.splice(result.destination.index, 0, removed);

    // Update order values
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(updatedSections);
  };

  const resetToDefaults = () => {
    setSections(defaultSections);
    toast({
      title: "Reset complet",
      description: "Sidebar-ul a fost resetat la setările implicite.",
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Se încarcă...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Personalizare Sidebar
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Alege ce secțiuni să fie vizibile în sidebar și schimbă-le ordinea prin drag & drop.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={saveSidebarPreferences}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset la Default
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sidebar-sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {sections.map((section, index) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          
                          <Label 
                            htmlFor={`section-${section.id}`}
                            className={`cursor-pointer text-sm font-medium ${
                              section.enabled 
                                ? 'text-gray-900 dark:text-gray-100' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {section.title}
                          </Label>
                        </div>

                        <Switch
                          id={`section-${section.id}`}
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Sfaturi de utilizare:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Trageți elementele pentru a le reordona</li>
            <li>• Folosiți switch-urile pentru a activa/dezactiva secțiuni</li>
            <li>• Modificările se aplică imediat după salvare</li>
            <li>• Secțiunile dezactivate nu vor apărea în sidebar</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SidebarCustomizer;