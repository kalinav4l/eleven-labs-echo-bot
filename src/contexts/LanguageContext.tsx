
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'ro';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys and their values for each language
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.agents': 'Agents',
    'nav.voices': 'Voices',
    'nav.transcript': 'Transcript',
    'nav.outbound': 'Outbound',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.name': 'Name',
    'common.phone': 'Phone',
    'common.country': 'Country',
    'common.location': 'Location',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.cost': 'Cost',
    
    // Account Settings
    'settings.title': 'Settings',
    'settings.description': 'Configure your AI agent preferences',
    'settings.general': 'General Settings',
    'settings.defaultLanguage': 'Default Language',
    'settings.defaultVoice': 'Default Voice',
    'settings.autoStart': 'Auto Start',
    'settings.autoStartDesc': 'Automatically start conversation when entering the site',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Receive notifications for new messages',
    'settings.audio': 'Audio Settings',
    'settings.volume': 'Volume',
    'settings.audioQuality': 'Audio Quality',
    'settings.speechSpeed': 'Speech Speed',
    'settings.privacy': 'Privacy & Security',
    'settings.saveConversations': 'Save Conversations',
    'settings.saveConversationsDesc': 'Store conversations for history',
    'settings.analyzeConversations': 'Analyze Conversations',
    'settings.analyzeConversationsDesc': 'Allow analysis for improvements',
    'settings.shareData': 'Share Data',
    'settings.shareDataDesc': 'Share anonymous data for research',
    'settings.accountInfo': 'Account Information',
    'settings.currentPlan': 'Current Plan',
    'settings.upgrade': 'Upgrade',
    'settings.saveSettings': 'Save Settings',
    
    // Voices
    'voices.title': 'Voices',
    'voices.description': 'Browse and preview available ElevenLabs voices',
    'voices.searchPlaceholder': 'Search voices...',
    'voices.category': 'Category',
    'voices.description_col': 'Description',
    'voices.verified': 'Verified',
    'voices.noDescription': 'No description available',
    'voices.isVerified': '✓ Verified',
    'voices.notVerified': 'Not verified',
    'voices.noVoicesFound': 'No voices found',
    'voices.showingCount': 'Showing {count} of {total} voices',
    
    // Outbound
    'outbound.title': 'Outbound',
    'outbound.description': 'Manage outbound calls and contact databases',
    'outbound.uploadCSV': 'Upload CSV Database',
    'outbound.dragDrop': 'Drag & drop or select a CSV file',
    'outbound.format': 'Format: Name, Phone, Country, Location',
    'outbound.selectCSV': 'Select CSV',
    'outbound.uploadContacts': 'Upload Contacts',
    'outbound.processCSV': 'Processing CSV...',
    'outbound.callConfiguration': 'Call Configuration',
    'outbound.agentId': 'Agent ID for Calls',
    'outbound.agentIdPlaceholder': 'agent_id_for_calls',
    'outbound.contactsLoaded': '{count} contacts loaded, {selected} selected',
    'outbound.selectAll': 'Select All',
    'outbound.deselectAll': 'Deselect All',
    'outbound.initiateSelected': 'Initiate Selected Calls ({count})',
    'outbound.initiating': 'Initiating Calls...',
    'outbound.contactsTable': 'Loaded Contacts ({count})',
    'outbound.callHistory': 'Call History ({count})',
    'outbound.searchPlaceholder': 'Search by phone number or name...',
    'outbound.number': 'Number',
    'outbound.conclusion': 'Conclusion',
    'outbound.dialog': 'Dialog',
    'outbound.noHistory': 'No calls in history yet.',
    'outbound.noSearchResults': 'No calls found matching the search term.',
    'outbound.clearFilter': 'Clear filter',
    'outbound.csvFormat': 'CSV Format',
    'outbound.maxSize': 'Maximum Size',
    'outbound.telephony': 'Telephony',
    'outbound.maxSizeValue': '1 MB per file',
    'outbound.telephonyValue': 'ElevenLabs Outbound',
    
    // Status messages
    'status.success': 'Success',
    'status.failed': 'Failed',
    'status.busy': 'Busy',
    'status.noAnswer': 'No Answer',
    'status.unknown': 'Unknown',
    
    // Languages
    'language.ro': 'Romanian',
    'language.en': 'English',
    'language.ru': 'Russian',
    'language.es': 'Spanish',
    'language.fr': 'French',
    
    // Audio quality
    'audio.low': 'Low (faster)',
    'audio.medium': 'Medium',
    'audio.high': 'High (recommended)',
    
    // Speech speed
    'speech.slow': 'Slow',
    'speech.normal': 'Normal',
    'speech.fast': 'Fast',
  },
  ru: {
    // Navigation
    'nav.dashboard': 'Панель управления',
    'nav.agents': 'Агенты',
    'nav.voices': 'Голоса',
    'nav.transcript': 'Транскрипт',
    'nav.outbound': 'Исходящие',
    'nav.settings': 'Настройки',
    'nav.logout': 'Выход',
    
    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.search': 'Поиск',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успех',
    'common.name': 'Имя',
    'common.phone': 'Телефон',
    'common.country': 'Страна',
    'common.location': 'Местоположение',
    'common.date': 'Дата',
    'common.status': 'Статус',
    'common.actions': 'Действия',
    'common.cost': 'Стоимость',
    
    // Account Settings
    'settings.title': 'Настройки',
    'settings.description': 'Настройте предпочтения ваших AI агентов',
    'settings.general': 'Общие настройки',
    'settings.defaultLanguage': 'Язык по умолчанию',
    'settings.defaultVoice': 'Голос по умолчанию',
    'settings.autoStart': 'Автозапуск',
    'settings.autoStartDesc': 'Автоматически начинать разговор при входе на сайт',
    'settings.notifications': 'Уведомления',
    'settings.notificationsDesc': 'Получать уведомления о новых сообщениях',
    'settings.audio': 'Настройки аудио',
    'settings.volume': 'Громкость',
    'settings.audioQuality': 'Качество аудио',
    'settings.speechSpeed': 'Скорость речи',
    'settings.privacy': 'Конфиденциальность и безопасность',
    'settings.saveConversations': 'Сохранять разговоры',
    'settings.saveConversationsDesc': 'Сохранять разговоры в истории',
    'settings.analyzeConversations': 'Анализировать разговоры',
    'settings.analyzeConversationsDesc': 'Разрешить анализ для улучшений',
    'settings.shareData': 'Делиться данными',
    'settings.shareDataDesc': 'Делиться анонимными данными для исследований',
    'settings.accountInfo': 'Информация об аккаунте',
    'settings.currentPlan': 'Текущий план',
    'settings.upgrade': 'Обновить',
    'settings.saveSettings': 'Сохранить настройки',
    
    // Voices
    'voices.title': 'Голоса',
    'voices.description': 'Просматривайте и прослушивайте доступные голоса ElevenLabs',
    'voices.searchPlaceholder': 'Поиск голосов...',
    'voices.category': 'Категория',
    'voices.description_col': 'Описание',
    'voices.verified': 'Проверен',
    'voices.noDescription': 'Описание недоступно',
    'voices.isVerified': '✓ Проверен',
    'voices.notVerified': 'Не проверен',
    'voices.noVoicesFound': 'Голоса не найдены',
    'voices.showingCount': 'Показано {count} из {total} голосов',
    
    // Outbound
    'outbound.title': 'Исходящие',
    'outbound.description': 'Управление исходящими звонками и базами контактов',
    'outbound.uploadCSV': 'Загрузить CSV базу данных',
    'outbound.dragDrop': 'Перетащите или выберите CSV файл',
    'outbound.format': 'Формат: Имя, Телефон, Страна, Местоположение',
    'outbound.selectCSV': 'Выбрать CSV',
    'outbound.uploadContacts': 'Загрузить контакты',
    'outbound.processCSV': 'Обработка CSV...',
    'outbound.callConfiguration': 'Настройка звонков',
    'outbound.agentId': 'ID агента для звонков',
    'outbound.agentIdPlaceholder': 'agent_id_для_звонков',
    'outbound.contactsLoaded': '{count} контактов загружено, {selected} выбрано',
    'outbound.selectAll': 'Выбрать все',
    'outbound.deselectAll': 'Отменить выбор',
    'outbound.initiateSelected': 'Инициировать выбранные звонки ({count})',
    'outbound.initiating': 'Инициация звонков...',
    'outbound.contactsTable': 'Загруженные контакты ({count})',
    'outbound.callHistory': 'История звонков ({count})',
    'outbound.searchPlaceholder': 'Поиск по номеру телефона или имени...',
    'outbound.number': 'Номер',
    'outbound.conclusion': 'Заключение',
    'outbound.dialog': 'Диалог',
    'outbound.noHistory': 'Пока нет звонков в истории.',
    'outbound.noSearchResults': 'Не найдено звонков, соответствующих поисковому запросу.',
    'outbound.clearFilter': 'Очистить фильтр',
    'outbound.csvFormat': 'Формат CSV',
    'outbound.maxSize': 'Максимальный размер',
    'outbound.telephony': 'Телефония',
    'outbound.maxSizeValue': '1 МБ на файл',
    'outbound.telephonyValue': 'ElevenLabs Исходящие',
    
    // Status messages
    'status.success': 'Успех',
    'status.failed': 'Неудача',
    'status.busy': 'Занято',
    'status.noAnswer': 'Не отвечает',
    'status.unknown': 'Неизвестно',
    
    // Languages
    'language.ro': 'Румынский',
    'language.en': 'Английский',
    'language.ru': 'Русский',
    'language.es': 'Испанский',
    'language.fr': 'Французский',
    
    // Audio quality
    'audio.low': 'Низкое (быстрее)',
    'audio.medium': 'Среднее',
    'audio.high': 'Высокое (рекомендуется)',
    
    // Speech speed
    'speech.slow': 'Медленно',
    'speech.normal': 'Нормально',
    'speech.fast': 'Быстро',
  },
  ro: {
    // Navigation
    'nav.dashboard': 'Tablou de bord',
    'nav.agents': 'Agenți',
    'nav.voices': 'Voci',
    'nav.transcript': 'Transcript',
    'nav.outbound': 'Outbound',
    'nav.settings': 'Setări',
    'nav.logout': 'Deconectare',
    
    // Common
    'common.save': 'Salvează',
    'common.cancel': 'Anulează',
    'common.delete': 'Șterge',
    'common.edit': 'Editează',
    'common.search': 'Caută',
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    'common.name': 'Nume',
    'common.phone': 'Telefon',
    'common.country': 'Țara',
    'common.location': 'Locație',
    'common.date': 'Data',
    'common.status': 'Status',
    'common.actions': 'Acțiuni',
    'common.cost': 'Cost',
    
    // Account Settings
    'settings.title': 'Setări',
    'settings.description': 'Configurează preferințele tale pentru agenții AI',
    'settings.general': 'Setări Generale',
    'settings.defaultLanguage': 'Limbă Implicită',
    'settings.defaultVoice': 'Voce Implicită',
    'settings.autoStart': 'Pornire Automată',
    'settings.autoStartDesc': 'Pornește automat conversația când intri pe site',
    'settings.notifications': 'Notificări',
    'settings.notificationsDesc': 'Primește notificări pentru mesaje noi',
    'settings.audio': 'Setări Audio',
    'settings.volume': 'Volum',
    'settings.audioQuality': 'Calitate Audio',
    'settings.speechSpeed': 'Viteză Vorbire',
    'settings.privacy': 'Confidențialitate & Securitate',
    'settings.saveConversations': 'Salvează Conversațiile',
    'settings.saveConversationsDesc': 'Stochează conversațiile pentru istoric',
    'settings.analyzeConversations': 'Analiză Conversații',
    'settings.analyzeConversationsDesc': 'Permite analiza pentru îmbunătățiri',
    'settings.shareData': 'Partajare Date',
    'settings.shareDataDesc': 'Partajează date anonime pentru cercetare',
    'settings.accountInfo': 'Informații Cont',
    'settings.currentPlan': 'Plan Curent',
    'settings.upgrade': 'Upgrade',
    'settings.saveSettings': 'Salvează Setările',
    
    // Voices
    'voices.title': 'Voci',
    'voices.description': 'Navighează și ascultă vocile disponibile ElevenLabs',
    'voices.searchPlaceholder': 'Caută voci...',
    'voices.category': 'Categorie',
    'voices.description_col': 'Descriere',
    'voices.verified': 'Verificat',
    'voices.noDescription': 'Nu există descriere disponibilă',
    'voices.isVerified': '✓ Verificat',
    'voices.notVerified': 'Nu este verificat',
    'voices.noVoicesFound': 'Nu s-au găsit voci',
    'voices.showingCount': 'Se afișează {count} din {total} voci',
    
    // Outbound
    'outbound.title': 'Outbound',
    'outbound.description': 'Gestionează apelurile outbound și bazele de date de contacte',
    'outbound.uploadCSV': 'Upload Bază de Date CSV',
    'outbound.dragDrop': 'Drag & drop sau selectează un fișier CSV',
    'outbound.format': 'Format: Nume, Telefon, Țara, Locație',
    'outbound.selectCSV': 'Selectează CSV',
    'outbound.uploadContacts': 'Încarcă Contacte',
    'outbound.processCSV': 'Procesează CSV...',
    'outbound.callConfiguration': 'Configurare Apeluri',
    'outbound.agentId': 'ID Agent pentru Apeluri',
    'outbound.agentIdPlaceholder': 'agent_id_pentru_apeluri',
    'outbound.contactsLoaded': '{count} contacte încărcate, {selected} selectate',
    'outbound.selectAll': 'Selectează Tot',
    'outbound.deselectAll': 'Deselectează Tot',
    'outbound.initiateSelected': 'Inițiază Apeluri Selectate ({count})',
    'outbound.initiating': 'Inițiază Apeluri...',
    'outbound.contactsTable': 'Contacte Încărcate ({count})',
    'outbound.callHistory': 'Istoric Apeluri ({count})',
    'outbound.searchPlaceholder': 'Caută după numărul de telefon sau nume...',
    'outbound.number': 'Number',
    'outbound.conclusion': 'Concluzie',
    'outbound.dialog': 'Dialog',
    'outbound.noHistory': 'Nu există încă apeluri în istoric.',
    'outbound.noSearchResults': 'Nu s-au găsit apeluri care să se potrivească cu termenul de căutare.',
    'outbound.clearFilter': 'Șterge filtrul',
    'outbound.csvFormat': 'Format CSV',
    'outbound.maxSize': 'Mărime Maximă',
    'outbound.telephony': 'Telefonie',
    'outbound.maxSizeValue': '1 MB per fișier',
    'outbound.telephonyValue': 'ElevenLabs Outbound',
    
    // Status messages
    'status.success': 'Succes',
    'status.failed': 'Eșuat',
    'status.busy': 'Ocupat',
    'status.noAnswer': 'Nu răspunde',
    'status.unknown': 'Necunoscut',
    
    // Languages
    'language.ro': 'Română',
    'language.en': 'English',
    'language.ru': 'Русский',
    'language.es': 'Español',
    'language.fr': 'Français',
    
    // Audio quality
    'audio.low': 'Scăzută (mai rapid)',
    'audio.medium': 'Medie',
    'audio.high': 'Înaltă (recomandat)',
    
    // Speech speed
    'speech.slow': 'Încet',
    'speech.normal': 'Normal',
    'speech.fast': 'Rapid',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ro';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
