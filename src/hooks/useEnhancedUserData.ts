import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from '@/hooks/use-toast';

export interface UserDatabase {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  webhook_token: string;
  created_at: string;
  updated_at: string;
}

export interface UserDataColumn {
  id: string;
  user_id: string;
  database_id: string;
  column_name: string;
  column_type: 'text' | 'number' | 'date' | 'boolean';
  is_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedUserData {
  id: string;
  user_id: string;
  database_id: string;
  name: string;
  number?: string;
  location?: string;
  info?: string;
  date_user: string;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useEnhancedUserData = () => {
  const [userData, setUserData] = useState<EnhancedUserData[]>([]);
  const [databases, setDatabases] = useState<UserDatabase[]>([]);
  const [columns, setColumns] = useState<UserDataColumn[]>([]);
  const [currentDatabase, setCurrentDatabase] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { copyToClipboard } = useClipboard();

  // Fetch all databases
  const fetchDatabases = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_databases')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      setDatabases(data || []);
      
      // Set current database to default or first one
      if (data && data.length > 0 && !currentDatabase) {
        const defaultDb = data.find(db => db.is_default) || data[0];
        setCurrentDatabase(defaultDb.id);
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca bazele de date.",
        variant: "destructive"
      });
    }
  };

  // Fetch columns for current database
  const fetchColumns = async (databaseId: string) => {
    if (!user || !databaseId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_data_columns')
        .select('*')
        .eq('user_id', user.id)
        .eq('database_id', databaseId)
        .order('display_order');

      if (error) throw error;
      setColumns((data || []) as UserDataColumn[]);
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  // Fetch user data for current database
  const fetchUserData = async (databaseId?: string) => {
    if (!user) return;
    
    const dbId = databaseId || currentDatabase;
    if (!dbId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('database_id', dbId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserData((data || []) as EnhancedUserData[]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca datele.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new database
  const createDatabase = async (name: string, description?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_databases')
        .insert([{
          user_id: user.id,
          name,
          description,
          is_default: databases.length === 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      setDatabases(prev => [...prev, data]);
      toast({
        title: "Succes",
        description: "Baza de date a fost creată cu succes."
      });
      
      return data;
    } catch (error) {
      console.error('Error creating database:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea baza de date.",
        variant: "destructive"
      });
    }
  };

  // Create custom column
  const createColumn = async (columnName: string, columnType: UserDataColumn['column_type'], isRequired = false) => {
    if (!user || !currentDatabase) return;

    try {
      const maxOrder = Math.max(...columns.map(c => c.display_order), -1);
      
      const { data, error } = await supabase
        .from('user_data_columns')
        .insert([{
          user_id: user.id,
          database_id: currentDatabase,
          column_name: columnName,
          column_type: columnType,
          is_required: isRequired,
          display_order: maxOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;
      
      setColumns(prev => [...prev, data as UserDataColumn]);
      toast({
        title: "Succes",
        description: "Coloana a fost adăugată cu succes."
      });
      
      return data;
    } catch (error) {
      console.error('Error creating column:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga coloana.",
        variant: "destructive"
      });
    }
  };

  // Create user data entry
  const createUserData = async (data: Partial<EnhancedUserData>) => {
    if (!user || !currentDatabase) return;

    try {
      const { data: newData, error } = await supabase
        .from('user_data')
        .insert([{
          user_id: user.id,
          database_id: currentDatabase,
          name: data.name,
          number: data.number,
          location: data.location,
          info: data.info,
          date_user: data.date_user || new Date().toISOString(),
          custom_fields: data.custom_fields || {}
        }])
        .select()
        .single();

      if (error) throw error;
      
      setUserData(prev => [newData as EnhancedUserData, ...prev]);
      toast({
        title: "Succes",
        description: "Înregistrarea a fost adăugată cu succes."
      });
      
      return newData;
    } catch (error) {
      console.error('Error creating user data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga înregistrarea.",
        variant: "destructive"
      });
    }
  };

  // Update user data entry
  const updateUserData = async (id: string, data: Partial<EnhancedUserData>) => {
    if (!user) return;

    try {
      const { data: updatedData, error } = await supabase
        .from('user_data')
        .update({
          name: data.name,
          number: data.number,
          location: data.location,
          info: data.info,
          date_user: data.date_user,
          custom_fields: data.custom_fields
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUserData(prev => prev.map(item => item.id === id ? updatedData as EnhancedUserData : item));
      toast({
        title: "Succes",
        description: "Înregistrarea a fost actualizată cu succes."
      });
      
      return updatedData;
    } catch (error) {
      console.error('Error updating user data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza înregistrarea.",
        variant: "destructive"
      });
    }
  };

  // Delete user data entry
  const deleteUserData = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setUserData(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Succes",
        description: "Înregistrarea a fost ștearsă cu succes."
      });
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge înregistrarea.",
        variant: "destructive"
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (userData.length === 0) {
      toast({
        title: "Atenție",
        description: "Nu există date pentru export.",
        variant: "destructive"
      });
      return;
    }

    // Create headers - standard columns + custom columns
    const standardHeaders = ['Nume', 'Număr', 'Locație', 'Data', 'Informații'];
    const customHeaders = columns.map(col => col.column_name);
    const headers = [...standardHeaders, ...customHeaders];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...userData.map(item => {
        const standardValues = [
          `"${item.name || ''}"`,
          `"${item.number || ''}"`,
          `"${item.location || ''}"`,
          `"${item.date_user || ''}"`,
          `"${item.info || ''}"`
        ];
        
        const customValues = columns.map(col => {
          const value = item.custom_fields[col.column_name] || '';
          return `"${value}"`;
        });
        
        return [...standardValues, ...customValues].join(',');
      })
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy webhook URL
  const copyWebhookURL = (database: UserDatabase) => {
    const webhookURL = `${window.location.origin}/api/webhook/${database.webhook_token}`;
    copyToClipboard(webhookURL);
  };

  // Switch current database
  const switchDatabase = (databaseId: string) => {
    setCurrentDatabase(databaseId);
    fetchUserData(databaseId);
    fetchColumns(databaseId);
  };

  useEffect(() => {
    if (user) {
      fetchDatabases();
    }
  }, [user]);

  useEffect(() => {
    if (currentDatabase) {
      fetchUserData();
      fetchColumns(currentDatabase);
    }
  }, [currentDatabase]);

  return {
    userData,
    databases,
    columns,
    currentDatabase,
    isLoading,
    createDatabase,
    createColumn,
    createUserData,
    updateUserData,
    deleteUserData,
    exportToCSV,
    copyWebhookURL,
    switchDatabase,
    refreshData: () => fetchUserData()
  };
};