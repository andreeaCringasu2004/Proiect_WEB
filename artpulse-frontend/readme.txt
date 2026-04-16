# Readme ArtPulse - Manual Tehnic de Utilizare

## 1. Arhitectura și Structura Proiectului

Frontend-ul pentru proiectul ArtPulse este construit folosind **React 18** și **TypeScript**, punând un accent deosebit pe starea globală reactivă și interacțiunea în timp real.

### Organizarea Fișierelor
- **`src/context/`**: Inima aplicației. `DataContext.tsx` gestionează toți utilizatorii, produsele și licitațiile, simulând o bază de date persistentă prin `localStorage`.
- **`src/pages/`**: Conține paginile principale (ex: HomePage, Auctions, Dashboard si restul de pagini din proiect ).
- **`src/components/`**: Elemente UI reutilizabile (ex: Nav, Footer, Modale de plată, Galeria Auto, Chat-ul flotant).
- **`src/styles/`**: Fișierul `globals.css` care definește identitatea vizuală prin variabile CSS.

---

## 2. Importanța Fișierelor de Configurare (Key Files)

- **`package.json`**: Lista completă de dependențe. Proiectul folosește `react-router-dom` pentru navigare și `leaflet` pentru harta + un link catre google Maps pentru a putea vedea locatia si de acolo.
- **`websocket-server.js`**: Un motor Node.js pentru comunicarea bidirecțională. Fără acesta, chat-ul și bid-urile nu ar fi "live" între multiple instanțe de browser.
- **`reportWebVitals.ts`**: Utilizat pentru monitorizarea sănătății aplicației (viteza de încărcare).
- **`populate_database.sql`**: Documentează structura SQL ideală a proiectului, oferind context despre relațiile dintre entități (Users -> Products -> Auctions). A fost necesara deoarece proiectul in acest moment este doar pe partea de frontend dezvoltat in React.
- **`.env.example`**: Configurare pentru variabile de sistem (momentan opțional, datorită utilizării Leaflet).  Initial am incercat sa folosesc cu API key pentru Google Maps dar nu am reusit sa il fac sa functioneze asa ca am schimbat pe leaflet.

---

## 3. Logica Automată de Licitație

Am implementat un **Monitor de Background** în `DataContext.tsx` care:
1. Verifică expirarea timpului la fiecare 5 secunde.
2. Schimbă statusul în **Sold** dacă există oferte.
3. Dacă nu există oferte, mută automat licitația la **Upcoming** și îi resetează timpul pentru a asigura continuitatea demo-ului.

## 4. Conformitate Specificații Laborator

Acest proiect a fost structurat pentru a asigura obținerea punctajului maxim, respectând toate specificațiile din tema de casă:

1.  **Module Autentificare & Cont**: Pagini de Login (`LoginPage.tsx`), Register (`RegisterPage.tsx`) și Editare Profil (`EditProfilePage.tsx`).
2.  **Pagina de Start / Homepage**: Implementată în `HomePage.tsx` cu hero slider și secțiuni informative.
3.  **Pagina Principală (Listare Produse)**: `AuctionPage.tsx` care permite vizualizarea, filtrarea (Live, Sold, Upcoming) și sortarea operelor.
4.  **Pagina de Administrare**: Dashboard administrativ complet în `AdminPage.tsx` cu statistici și management utilizatori.
5.  **Pagina de Contact**: Localizată în `InfoPage.tsx`. Conține date de contact, link-uri Social Media și o HARTĂ interactivă Leaflet.
6.  **Galerie de Imagini**: Implementată în `AuctionDetailPage.tsx`. Imaginile se schimbă AUTOMAT la interval de 3 secunde (utilizând un timer React).
7.  **Responsive**: Design adaptabil (Mobile/Tablet/Desktop) verificat pe toate paginile principale.
8.  **Design-ul Paginilor**: Estetică de lux ("Midnight Luxury") cu tipografie modernă și paletă de culori armonioasă.
9.  **Originalitate**: Utilizarea WebSocket-ului pentru interacțiune live (Chat/Bidding) și simularea unui backend reactiv prin `DataContext`.

---

## 5. Originalitate și Contribuții Personale

Acest proiect reflectă viziunea mea asupra unei platforme moderne de licitații de artă, având următoarele puncte de originalitate care atestă implicarea mea creativă și tehnică:

-   **Inspirație și Concept**: Deși m-am inspirat din platforme consacrate de e-commerce și site-uri de licitații generaliste, am adaptat conceptul specific pentru piața de artă plastică, punând accent pe fluxul de validare a produselor de către experți.
-   **Cromatica și Design-ul**: Paleta de culori a fost aleasă integral de mine, optând pentru un stil "Midnight Luxury" în modul dark pentru a sugera exclusivitate și eleganță, în contrast cu un stil curat și luminos în modul light.
-   **Sistemul Light/Dark Mode**: Ideea de a implementa ambele moduri de vizualizare mi-a aparținut, considerând că experiența utilizatorului trebuie să fie adaptabilă în funcție de mediul în care acesta vizualizează operele de artă.
-   **Arhitectura Bazei de Date (Mock)**: Deoarece proiectul este axat pe Front-End, am conceput de la zero structura de date din `DataContext` (Users, Products, Auctions) și am implementat un sistem de persistență prin `localStorage`, astfel încât orice acțiune (licitări, mesaje, editări) să se păstreze la reîncărcarea paginii.
-   **Logica de Monitorizare în Timpul Real**: Am implementat un sistem de monitorizare în background (setInterval) care verifică starea licitațiilor și le închide automat la expirare, mutându-le în categoria "Sold" sau repunându-le în vânzare, o logică complexă gândită special pentru acest demo.
-   **Integrare WebSocket**: Am configurat comunicarea bidirecțională pentru a simula un mediu de licitație real, unde utilizatorii primesc notificări și actualizări de preț instantaneu.
-   **Sistem de Roluri și UX Diferențiat**: Am proiectat și implementat experiențe de utilizare complet diferite pentru Seller, Expert și Admin. Fiecare rol beneficiază de un dashboard personalizat cu funcționalități specifice (ex: fluxul de evaluare pentru Experți vs managementul utilizatorilor pentru Admin).
-   **Securitate la Nivel de Interfață (RBAC)**: Am implementat o logică de barieră (Protected Routes simulate) care restricționează accesul la dashboard-uri în funcție de rolul utilizatorului logat, asigurând integritatea simulatorului.
-   **Galerie Media Interactivă**: În pagina de detalii a licitației, am creat o componentă de galerie inteligentă care derulează automat imaginile la 3 secunde, dar permite și interacțiunea manuală, îmbunătățind prezentarea operelor de artă. Astfel am dorit sa respect cerinta din tema de casa dar sa aiba si sens modul in care am integrat-o in proiect.
-   **Sistem de Chat Contextual**: Am dezvoltat un sistem de mesagerie integrat care permite comunicarea directă între vânzători și experți pe marginea procesului de evaluare, simulând un flux de business real.
-   **Optimizare Mobile-First Avansată**: Nu m-am rezumat la un design fluid, ci am creat soluții specifice pentru ecrane mici, cum ar fi meniurile "hamburger" personalizate și adaptarea chat-ului flotant pentru a nu obstrucționa vizibilitatea. Si aceasta functionalitate face parte din cerintele de la tema de casa, dar am ales sa o introduc la originalitae pentru ca partea cu dark mode si light mode a ajuns sa complice mult mai mult aceasta functionalitate si realizarea ei pana in acest punct al proiectului.

----

## 6. Manual Complet de Utilizare și Testare (Ghid End-to-End)

Dacă ai descărcat acest proiect sub formă de arhivă ZIP, urmează acești pași pentru a configura, rula și testa aplicația corect.

### 6.1. Pregătirea Mediului și Instalare
Asigură-te că ai instalat Node.js (v16+) și npm pe calculatorul tău.

1. Extrage arhiva ZIP într-un folder local.
2. Deschide un terminal în acel folder.
3. Execută:
   > npm install
   (Acest proces va descărca toate librăriile necesare, inclusiv React, TypeScript și Leaflet).

### 6.2. Pornirea Proiectului
Aplicația ArtPulse necesită două procese pentru funcționare optimă:

A. Serverul Frontend (Site-ul):
   În terminalul principal, rulează:
   > npm start
   Site-ul se va deschide automat la http://localhost:3000.

B. Serverul WebSocket (Funcții Live) - Opțional dar RECOMANDAT:
   Deschide un al doilea terminal în același folder și rulează:
   > node websocket-server.js
   *Fără acest pas, chat-ul și bidding-ul live între ferestre diferite nu vor funcționa.*

### 6.3. Ghid de Explorare a Rolurilor (RBAC)

Aplicația folosește un sistem avansat de Role-Based Access Control. Iată cum să testezi fiecare funcționalitate:

#### A. Guest (Vizitator)
- URL: http://localhost:3000/auctions
- Ce poți face: Vizualizezi toate operele live, explorezi galeriile de imagini (care se schimbă auto la 3s).
- Restricții: Butonul "Bid Now" este blocat; nu ai acces la Watchlist sau Chat.

#### B. Bidder (Licitator)
- Cum ajungi aici: Mergi la /register și selectează rolul "Bidder".
- Funcționalități: 
  - Poți adăuga produse la Watchlist (butonul inimioară).
  - Poți licita după validarea cardului (modalul acceptă orice card valid, exclude 0000... și carduri expirate).
  - Ai Chat activ cu Expertul.

#### C. Seller (Vânzător)
- Cum ajungi aici: Înregistrează-te ca "Seller".
- Funcționalități:
  - Dashboard personalizat cu situația operelor proprii.
  - Poți adăuga opere noi (vor apărea inițial în categoria "Unknown").
  - Poți vedea evaluarea Expertului și prețul sugerat de acesta.

#### D. Expert Evaluator
- Cum ajungi aici: Înregistrează-te ca "Expert".
- Funcționalități:
  - Revizuiește produsele trimise de Selleri.
  - Setează categoriile și prețul de pornire.
  - Chat direct cu Seller-ul pentru clarificări tehnice.

#### E. Admin
- Cum ajungi aici: Înregistrează-te ca "Admin".
- Funcționalități:
  - Panou de control global cu statistici și grafice generative.
  - Managementul utilizatorilor: Schimbare Live de roluri, Suspendare, Ștergere (Soft-delete cu Restore).
  - Audit Log complet: Toate acțiunile administrative sunt logate cu timestamp și detalii.

### 6.4. Rute și Pagini Importante
Dacă ești logat cu rolul corespunzător, poți accesa direct:
- /auctions - Lista de licitații (filtrare Live/Sold/Upcoming).
- /categories - Galeria de categorii cu auto-slide.
- /admin - Panoul de administrare.
- /expert/review - Pagina de evaluare a expertului.
- /seller/dashboard - Dashboard-ul vânzătorului.
- /info - Pagina de contact cu harta interactivă Leaflet.

---
*Proiect realizat pentru evaluarea de student Crîngașu Andreea-Gabriela, grupa C113D.*
