import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CSVUploadSection } from './CSVUploadSection';
import { BatchConfigPanel } from './BatchConfigPanel';
import { BatchStatusPanel } from './BatchStatusPanel';
import { useAutoRedial } from '@/hooks/useAutoRedial';

export const BatchTab: React.FC = () => {
  const { addToRedialQueue } = useAutoRedial();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>CSV Upload</CardTitle>
            <CardDescription>
              Upload your contacts list to start batch calling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CSVUploadSection 
              onFileSelect={() => document.getElementById('csv-input')?.click()} 
              onDownloadTemplate={() => {
                // Download template logic
                const csvContent = "nume,telefon,tara,locatie\nJohn Doe,+40712345678,Romania,Bucuresti\nJane Smith,+40798765432,Romania,Cluj";
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'template_contacte.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Status</CardTitle>
            <CardDescription>
              Monitor your batch calling progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BatchStatusPanel 
              isProcessing={false}
              isPaused={false}
              isStopped={false}
              currentProgress={0}
              totalCalls={0}
              callStatuses={[]}
              currentCallStatus=""
              onPause={() => {}}
              onResume={() => {}}
              onStop={() => {}}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <BatchConfigPanel
          selectedAgentId=""
          onAgentSelect={() => {}}
          selectedPhoneId=""
          onPhoneSelect={() => {}}
          totalRecipients={0}
          selectedRecipients={0}
          smsConfig={{
            enabled: false,
            apiToken: '',
            senderId: 'aichat',
            message: '',
            delay: 2
          }}
          onSMSConfigChange={() => {}}
        />
      </div>

      <input
        id="csv-input"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          // Handle CSV upload
          const file = e.target.files?.[0];
          if (file) {
            console.log('CSV file selected:', file.name);
          }
        }}
      />
    </div>
  );
};