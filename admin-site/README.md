# Kalina AI - Admin Panel

Panoul de administrare pentru aplicația Kalina AI, construit cu React, TypeScript și Tailwind CSS.

## Funcționalități

- **Autentificare securizată** - Doar utilizatorii cu rol de admin pot accesa
- **Gestionarea utilizatorilor** - Vizualizare, căutare și gestionare utilizatori
- **Administrarea creditelor** - Adăugare, scădere sau setare credite
- **Gestionarea soldului** - Modificarea soldului utilizatorilor în USD
- **Schimbarea rolurilor** - Promovare/retrogradare utilizatori (user, moderator, admin)
- **Ban/Unban utilizatori** - Blocarea/deblocarea accesului
- **Dashboard cu statistici** - Privire de ansamblu asupra activității
- **Istoric apeluri** - Monitorizarea tuturor apelurilor
- **Audit logs** - Urmărirea acțiunilor administrative

## Instalare și Configurare

1. **Instalarea dependințelor:**
   ```bash
   cd admin-site
   npm install
   ```

2. **Configurarea Supabase:**
   - URL-ul și cheia sunt configurate în `src/lib/supabase.ts`
   - Asigurați-vă că utilizatorul are rol de 'admin' în baza de date

3. **Pornirea în dezvoltare:**
   ```bash
   npm run dev
   ```
   Site-ul va fi disponibil la `http://localhost:5173`

4. **Build pentru producție:**
   ```bash
   npm run build
   ```

## Structura Proiectului

```
admin-site/
├── src/
│   ├── components/
│   │   ├── ui/              # Componente UI reutilizabile
│   │   ├── dialogs/         # Dialog-uri pentru acțiuni
│   │   ├── pages/           # Pagini administrative
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── LoginForm.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Context pentru autentificare
│   ├── lib/
│   │   ├── supabase.ts      # Client Supabase
│   │   └── utils.ts         # Funcții utilitare
│   ├── types/
│   │   └── admin.ts         # Tipuri TypeScript
│   └── App.tsx
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Securitate

- **Autentificare obligatorie** - Accesul este restricționat doar pentru admini
- **Verificare roluri** - Toate acțiunile verifică rolul de admin în backend
- **RLS Policies** - Row Level Security activat pe toate tabelele
- **Audit logging** - Toate acțiunile administrative sunt înregistrate

## Deployment

### Opțiunea 1: Subdomain
- Configurați `admin.kalina.com` să puncteze către acest site
- Setați DNS records corespunzătoare

### Opțiunea 2: Domeniu separat
- Înregistrați un domeniu separat (ex: `kalina-admin.com`)
- Configurați hosting și SSL

### Opțiunea 3: Folder pe același domeniu
- Deploy la `kalina.com/admin/`
- Configurați server-ul să servească fișierele statice

## Utilizare

1. **Login:** Conectați-vă cu un cont care are rol de 'admin'
2. **Dashboard:** Vizualizați statisticile generale
3. **Utilizatori:** Gestionați utilizatorii, creditele și rolurile
4. **Apeluri:** Monitorizați istoricul apelurilor
5. **Audit:** Verificați acțiunile administrative

## Note Importante

- Site-ul este complet separat de aplicația principală
- Folosește aceeași bază de date Supabase
- Toate acțiunile sunt auditate și securizate
- Interface-ul este optimizat pentru administratori