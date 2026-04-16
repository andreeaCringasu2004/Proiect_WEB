# ArtPulse — Tema de casă Tehnologii Web 2026

## Creating frontend using mockup data with React

## 1. Descriere Generală

ArtPulse este o platformă de licitații de artă fine cu interfață React + TypeScript completă. Permite utilizatorilor să exploreze, liciteze și colecționeze lucrări de artă de la artiști verificați.

**Stivă:** React 18 · TypeScript · React Router v6 · CSS Modules
Fără librării UI externe (no Bootstrap, no MUI).

---

## 2. Structura Fișierelor

```
src/
├── styles/
│   └── globals.css            ← Variabile CSS globale (design tokens)
├── context/
│   └── AuthContext.tsx        ← Stare autentificare + roluri
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx / .css  ← Navigare responsivă cu drawer mobil
│   │   └── Footer.tsx / .css
│   └── ChatWidget.tsx / .css  ← Chat flotant bidder ↔ expert
├── pages/
│   ├── HomePage.tsx / .css    ← Pagina de start
│   ├── LoginPage.tsx          ← Autentificare (folosește AuthPages.css)
│   ├── RegisterPage.tsx       ← Înregistrare cu selector de rol
│   ├── EditProfilePage.tsx / .css ← Editare profil, parolă, stats
│   ├── AuctionPage.tsx / .css ← Lista licitații (filtrare, paginare)
│   ├── AuctionDetailPage.tsx / .css ← Detaliu produs/colecție
│   ├── CategoriesPage.tsx / .css   ← Categorii + galerie auto 3s
│   ├── WatchlistPage.tsx / .css    ← Watchlist bidder + notificări
│   ├── SellerDashboard.tsx / .css  ← Dashboard vânzător
│   ├── ExpertPage.tsx / .css       ← Revizuire expert + chat polling
│   ├── AdminPage.tsx / .css        ← Panou admin complet
│   └── InfoPage.tsx / .css         ← Info / Contact
└── App.tsx                    ← Routing complet
```

---

## 3. Pagini Cerute în Temă — Mapare Completă

| Cerință | Implementare |
|---|---|
| ✅ Login / Register / Edit Profile | `LoginPage`, `RegisterPage`, `EditProfilePage` |
| ✅ Homepage | `HomePage` (Hero cu slideshow, Live Auctions, How It Works, CTA) |
| ✅ Pagina principală aplicație (listare produse) | `AuctionPage` (grid de carduri cu countdown, filtrare, sortare, paginare, buton Bid Now) |
| ✅ Pagina de administrare | `AdminPage` (Dashboard cu grafice, Users cu soft-delete + schimbare rol, Auctions, Audit Log complet) |
| ✅ Pagina de contact | `InfoPage` → tab "Contact & Location" (adresă, telefon, email, formular, hartă placeholder, linkuri Social Media Instagram / X / Facebook) |
| ✅ Galerie de imagini (auto 3 secunde) | `CategoriesPage` — AutoGallery component (3s + filmstrip); `AuctionDetailPage` — galerie produs cu auto-slide 3s + thumbnailuri; `HomePage` — hero slideshow |
| ✅ Responsive | Media queries în toate fișierele CSS; meniu hamburger mobil |
| ✅ Navigare statică | React Router — toate paginile linkate și funcționale |

---

## 4. Roluri și Acces

### A. Guest
- Vede toate produsele cu categorie ≠ Unknown
- Nu poate licita (buton blocat cu mesaj)
- Nu are watchlist, nu are chat

### B. Bidder
- Moștenește tot din Guest
- Buton inimioară pe fiecare card (WatchlistPage)
- Notificări sesiune: Start licitație, T-10 min, T-5 min (implementate în WatchlistPage cu `setInterval` real)
- Poate licita după validarea cardului (modal cu validare număr card, expiry, CVV — nu acceptă 0000... sau carduri expirate)
- Chat cu Expertul (ChatWidget)

### C. Seller
- Dashboard propriu (`SellerDashboard`) cu tabel produse + filtre
- Poate adăuga produs → intră automat în categoria "Unknown"
- Butonul "Launch Auction" este **BLOCAT** până Expertul categorisează
- Vede sugestia de preț a Expertului
- Chat cu Expertul prin ChatWidget

### D. Expert Evaluator
- Vede produsele Unknown (`ExpertPage`)
- Poate crea categorii noi sau selecta din lista existentă
- Poate sugera preț de start (vizibil Seller-ului)
- Chat cu Seller-ul cu polling la 2 secunde (simulat)
- Trimite mesaj automat în chat la categorisare

### E. Admin
- Dashboard cu statistici și grafice
- Gestionare utilizatori: schimbare rol (dropdown live), suspend, soft-delete (NU șterge fizic — păstrează istoricul), restore
- Gestionare licitații: view, end manual
- Audit Log complet cu toate acțiunile admin (timestamp, acțiune, target, detalii) — se actualizează în timp real la fiecare acțiune

---

## 5. Cum Accesezi Fiecare Rol (demo frontend static)

Mergi la `/register` și selectează rolul dorit, sau modifică temporar `AuthContext.tsx` pentru demo rapid:

| Rol | Metodă |
|---|---|
| Guest | Navighezi fără a te loga |
| Bidder | Register → selectează "Bidder" (implicit) |
| Seller | Register → selectează "Seller" |
| Expert | Modifică în LoginPage `onLogin({ name:'Expert', role:'expert' })` |
| Admin | Modifică în LoginPage `onLogin({ name:'Admin', role:'admin' })` |

### Adrese directe (după login cu rolul corect)

| Rută | Pagină |
|---|---|
| `/` | Homepage |
| `/auctions` | Lista licitații |
| `/auctions/1` | Detaliu: Lumière dorée (single) |
| `/auctions/2` | Detaliu: Silent Forms (single) |
| `/auctions/4` | Detaliu: Golden Hour — colecție de 5 opere |
| `/categories` | Categorii + galerie |
| `/watchlist` | Watchlist cu notificări (bidder) |
| `/seller/dashboard` | Dashboard vânzător (seller) |
| `/expert/review` | Revizuire produse (expert) |
| `/admin` | Panou admin complet (admin) |
| `/info` | Info + Contact |
| `/profile/edit` | Editare profil (orice user logat) |

---

## 6. Contribuții Originale

**a) Sistem de notificări de sesiune real**
Timer cu `setInterval` (1s) care monitorizează toate licitațiile din watchlist și trimite toast-uri la T-10 și T-5 minute. Toast-urile sunt stivuite (max 4) și au stiluri diferite per tip.

**b) Diferențiere produs unic vs. colecție**
- Produs unic → imagini din unghiuri diferite (Front, Detail, Side, Raking, Verso) cu label pe thumbnail
- Colecție → fiecare imagine = o operă, cu descriere individuală detaliată și click pe thumbnail evidențiază opera respectivă

**c) Chat Expert-Seller cu polling simulat la exact 2 secunde**
`setInterval(2000)` activ numai când tab-ul "Chat" este vizibil (economie de resurse). Seller-ul răspunde automat cu mesaje rotative. La categorisare, Expertul trimite automat un mesaj de confirmare.

**d) Soft Delete admin**
Utilizatorii "șterși" rămân în tabel (afișați opțional cu toggle), cu data ștergerii și badge distinctiv. Butonul "Restore" îi reactivează. Toate acțiunile sunt înregistrate în Audit Log.

**e) Audit Log live**
Tabel complet cu toate acțiunile admin, actualizat în timp real fără refresh (React state). Fiecare acțiune adaugă o intrare cu timestamp, admin care a acționat, tip acțiune și detalii.

**f) Validare card bancară completă**
Modal de plată cu validare: număr 16 cifre (respinge 0000...), expiry MM/YY (respinge carduri expirate), CVV 3-4 cifre, nume titular. Bid-ul este plasat **NUMAI** după validare reușită.

**g) Sistem de roluri cu 5 nivele + acces granular**
Protected route wrapper verifică rolul. Navbar afișează linkuri diferite per rol. Butonul Launch de la Seller este blocat programatic dacă produsul nu a fost categorisit de Expert.

**h) Design sistem coerent**
Playfair Display (display) + DM Sans (body) + DM Mono (timers). Variabile CSS centralizate în `globals.css`. Toate paginile partajează aceleași tokens fără duplicare.

---

## 7. Testare

```bash
npm install && npm start
```

Deschide [http://localhost:3000](http://localhost:3000) în browser.

**Testat în:** Google Chrome 123+, Mozilla Firefox 124+

**Rezoluții:** 1920px · 1440px · 1024px · 768px · 375px (iPhone SE)

---

---

## 8. Manual de Utilizare (Ghid de pornire de la ZERO)

Dacă ai descărcat acest proiect sub formă de arhivă ZIP, urmează acești pași pentru a-l rula corect pe mașina ta locală:

### Pasul 1: Pregătirea Mediului
Asigură-te că ai instalat **Node.js** (versiunea 16 sau mai mare) și **npm** pe calculator. Poți verifica rulând în terminal:
```bash
node -v
npm -v
```

### Pasul 2: Extragerea și Instalarea
1. Extrage conținutul arhivei ZIP într-un folder dedicat.
2. Deschide un terminal (sau Command Prompt / PowerShell) în acel folder.
3. Instalează toate dependențele necesare rulând:
```bash
npm install
```

### Pasul 3: Pornirea Aplicației (Frontend)
După terminarea instalării, pornește serverul de dezvoltare:
```bash
npm start
```
Aplicația se va deschide automat la adresa [http://localhost:3000](http://localhost:3000).

### Pasul 4: Pornirea Serverului de Chat (WebSocket) - Opțional
Pentru ca funcționalitatea de Chat și Bidding în timp real să fie activă între mai multe ferestre de browser, trebuie să pornești manual serverul de WebSocket:
1. Deschide un **AL DOILEA** terminal în folderul proiectului.
2. Rulează comanda:
```bash
node websocket-server.js
```
*Notă: Dacă nu pornești acest server, aplicația va funcționa în continuare, dar chat-ul nu va trimite mesaje în timp real către alte instanțe.*

### Pasul 5: Ghid de Testare (Quick Start)
Pentru a explora toate funcționalitățile, poți testa cele 5 roluri astfel:

1.  **Guest (Vizitator)**: Accesează direct [http://localhost:3000/auctions](http://localhost:3000/auctions). Poți vedea produsele, dar nu poți licita.
2.  **Bidder (Licitator)**: Mergi la `/register`, alege rolul "Bidder". Acum poți adăuga la Watchlist și poți licita (după ce introduci datele unui card în modalul de plată).
3.  **Seller (Vânzător)**: Înregistrează-te ca "Seller". Din dashboard, poți propune o lucrare nouă spre vânzare.
4.  **Expert**: Înregistrează-te ca "Expert". Vei vedea lucrările depuse de Selleri și le poți categorisi sau le poți seta prețul de pornire.
5.  **Admin**: Înregistrează-te ca "Admin". Vei avea acces la statistici globale, managementul utilizatorilor și log-uri de audit.

---
*Proiect realizat pentru evaluarea de student Crîngașu Andreea-Gabriela, grupa C113D.*
