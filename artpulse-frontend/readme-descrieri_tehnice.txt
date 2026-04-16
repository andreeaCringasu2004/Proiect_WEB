═══════════════════════════════════════════════════════════════
  ArtPulse — Tema de casă Tehnologii Web 2026
  README.TXT
═══════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────
1. DESCRIERE GENERALĂ
────────────────────────────────────────────────────────────────
ArtPulse este o platformă de licitații de artă fine cu interfață
web completă. Permite utilizatorilor să exploreze, liciteze și
colecționeze lucrări de artă de la artiști verificați.

Aplicația este construită cu React 18 + TypeScript, React Router
v6, și CSS modular per componentă, fără dependențe externe UI.

────────────────────────────────────────────────────────────────
2. ARHITECTURA TEMPLATE-URILOR
────────────────────────────────────────────────────────────────

Fișiere principale:
  App.tsx              — Routing principal, provider autentificare
  styles/globals.css   — Variabile CSS globale (tokens de design)
  context/AuthContext  — Gestionare stare autentificare (hook)

Pagini implementate:
  HomePage.tsx         — Pagina de start (Hero, Featured auctions,
                         How it works, Seller CTA)
  AuctionPage.tsx      — Lista licitații cu filtrare, căutare,
                         sortare și paginare
  AuctionDetailPage.tsx — Detaliu licitație: galerie imagini cu
                         auto-slide la 3s, panoul de licitare,
                         countdown, bid history, Related auctions
  CategoriesPage.tsx   — Categorii cu gallery auto-rotate 3s,
                         filtrare pe categorie, produse cu butoane
                         Details + Bid
  InfoPage.tsx         — Pagina Info cu tab-uri: Our Story,
                         How It Works, Contact & Location
                         (include hartă, formular, social media)
  LoginPage.tsx        — Autentificare cu validare
  RegisterPage.tsx     — Înregistrare cu selector de rol
  EditProfilePage.tsx  — Editare profil, schimbare parolă,
                         statistici activitate, Danger Zone
  AdminPage.tsx        — Panou administrare: Dashboard cu grafice,
                         management licitații, management utilizatori
  Navbar.tsx           — Navigare responsivă cu drawer mobil
  Footer.tsx           — Footer cu linkuri, social media

────────────────────────────────────────────────────────────────
3. PAGINI CERUTE ÎN TEMĂ — MAPARE
────────────────────────────────────────────────────────────────
✓ Login/Register/Edit Profile  → LoginPage, RegisterPage, EditProfilePage
✓ Homepage                     → HomePage
✓ Pagina principală aplicație  → AuctionPage (listing licitații)
✓ Pagina administrare          → AdminPage (/admin, rolul "admin")
✓ Pagina Contact               → InfoPage → tab "Contact & Location"
                                 (date contact, hartă placeholder,
                                  formular email, linkuri Social Media)
✓ Galerie imagini (auto 3s)    → CategoriesPage (AutoGallery component)
                                 + AuctionDetailPage (galerie produs)
                                 + HomePage (hero slideshow)
✓ Responsive                   → Media queries în toate fișierele CSS
✓ Navigare statică             → React Router, toate paginile linkate

────────────────────────────────────────────────────────────────
4. CONTRIBUȚII ORIGINALE (pentru punctajul de originalitate)
────────────────────────────────────────────────────────────────
a) Sistem de autentificare cu roluri multiple:
   guest, bidder, seller, expert, admin — fiecare cu acces diferit.
   Demo: la login se poate selecta rolul din RegisterPage.

b) Butonul "Bid Now" blocat pentru Guest (afișează mesaj cu link
   spre login/register, nu redirecționează forțat).

c) Galerie imagini cu auto-slide la 3 secunde + bară de progres
   animată (CSS animation) + thumbnail strip + navigare manuală.
   Implementată independent în: AuctionDetailPage, CategoriesPage,
   și HomePage.

d) Countdown live per licitație (hook useCountdown cu setInterval),
   afișat în format HH:MM:SS și colorat în roșu când < 15 minute.

e) Bid History interactivă cu toggle — afișează lista de oferte,
   și se actualizează în timp real la plasarea unui bid nou.

f) Filtrare + sortare + căutare + paginare în AuctionPage, toate
   combinate și reactive (React useState + useMemo).

g) Admin panel cu:
   - grafic cu bare (CSS nativ, fără librărie)
   - grafic donut (CSS conic-gradient)
   - tabele căutabile cu acțiuni (suspend/reactivate user, end auction)

h) Design sistem coerent:
   - Fonturi: Playfair Display (display) + DM Sans (body) + DM Mono
   - Culori: variabile CSS în globals.css (--cream, --ink, --gold etc.)
   - Animații: fadeUp, progress bar, hover transforms

────────────────────────────────────────────────────────────────
5. INSTRUCȚIUNI DE RULARE
────────────────────────────────────────────────────────────────
Cerințe: Node.js 18+, npm 9+

  git clone / dezarhivare proiect
  npm install
  npm start         ← dev server pe http://localhost:3000

Conturi demo (simulare — fără backend real):
  Orice email + parolă funcționează la login.
  Rolul se selectează la înregistrare.
  Pentru Admin Panel: înregistrați-vă cu rolul implicit și
  modificați manual în AuthContext role → 'admin', SAU
  folosiți email: admin@example.com la login (demo auto-assign).

Navigare:
  /             → Homepage
  /auctions     → Lista licitații
  /auctions/1   → Detaliu licitație (Lumière dorée)
  /auctions/2   → Detaliu licitație (Silent Forms)
  /categories   → Categorii
  /info         → Info / Contact
  /login        → Autentificare
  /register     → Înregistrare
  /profile/edit → Editare profil (necesită login)
  /admin        → Admin panel (necesită rolul admin)

────────────────────────────────────────────────────────────────
6. TEHNOLOGII UTILIZATE
────────────────────────────────────────────────────────────────
  React 18 + TypeScript
  React Router v6
  CSS Modules (fișier separat per pagină + fișier global)
  Google Fonts: Playfair Display, DM Sans, DM Mono
  Imagini: Unsplash CDN (fără download local)
  Fără librării UI externe (Bootstrap, MUI etc.)

────────────────────────────────────────────────────────────────
7. TESTARE
────────────────────────────────────────────────────────────────
Testat în: Google Chrome 123+, Mozilla Firefox 124+, Microsoft Edge 123+
Rezoluții testate: 1920px, 1440px, 1024px, 768px, 375px

═══════════════════════════════════════════════════════════════