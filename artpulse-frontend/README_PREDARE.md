# 🏛️ Documentație Predare Frontend ArtPulse - Platformă de Licitații de Artă

Acest document detaliază realizarea proiectului **ArtPulse**, acoperind arhitectura, fluxurile de date și modul în care cerințele academice sunt îndeplinite și depășite, într-o varianta mai placuta vizual.

---

## 💎 1. Filosofia de Design și UX
ArtPulse adoptă un stil **"Midnight Luxury"**, utilizând o paletă de culori rafinată ( Auriu, Crem, Tonuri de gri, Cerneală si Negru) și tipografie premium (`Playfair Display`). 
- **Suport Dark Mode complet**: Gestionat prin variabile CSS dinamice.
- **Responsivitate**: Adaptare fluidă pentru Mobile, Tabletă și Desktop folosind Grid și Flexbox.

---

## 🏗️ 2. Arhitectura Tehnică (Originalitate & Performanță)

### 📊 Managementul Stării (State Management)
Aplicația folosește un sistem centralizat **`DataContext`** (Context API) care servește drept "Single Source of Truth".
- **Persistență**: Datele sunt salvate în `localStorage`, asigurând păstrarea bid-urilor și a modificărilor de profil chiar și după refresh-ul paginii.
- **Background Workers**: Un motor de monitorizare integrat în context care actualizează statusurile licitațiilor (Live -> Sold) în timp real, fără intervenția utilizatorului.

### 🔌 Interacțiune Real-Time (WebSocket)
Pentru a oferi o experiență autentică de licitație, am implementat un server **WebSocket** standalone:
- **Chat**: Comunicare instantanee între Seller și Expert.
- **Live Bidding**: Actualizarea automată a prețului curent pe toate browserele deschise atunci când cineva plasează o ofertă.

---

## 🔄 3. Fluxul Operațional (User Workflows)

Proiectul acoperă întreg ciclul de viață al unei opere de artă:
1.  **Depunere (Seller)**: Utilizatorul încarcă detalii și imagini.
2.  **Evaluare (Expert)**: Expertul analizează cererea, discută via chat și programează o întâlnire fizică (harta interactivă Leaflet).
3.  **Licitare (Bidder)**: Opera devine Live pe pagina de licitații cu countdown activ.
4.  **Adjudecare & Plată**: La terminarea timpului, câștigătorul este notificat și poate accesa modulul de plată securizat.

---

## ✅ 4. Respectarea Criteriilor de Evaluare

| Criteriu | Implementare și Fișiere Cheie | Detalii Tehnice |
| :--- | :--- | :--- |
| **Autentificare** | `LoginPage`, `RegisterPage` | Roluri: Admin, Expert, Seller, Bidder. |
| **Homepage** | `HomePage.tsx` | Hero Slideshow, secțiune de licitații dinamice. |
| **Listare Produse** | `AuctionPage.tsx` | Filtrare avansată, sortare, countdown real. |
| **Administrare** | `AdminPage.tsx` | Management useri, statistici grafice (Charts). |
| **Hartă & Contact** | `InfoPage.tsx` | Integrare Leaflet (Open Source, fără chei API). |
| **Galerie Imagini** | `AutoGallery.tsx` | Auto-derulare la 3 secunde, gestiune thumbnail-uri. |
| **Dark Mode** | `globals.css` | Trecere instantanee via `data-theme`. |
| **Originalitate** | `websocket-server.js` | Chat live și sistem de bidding reactiv. |

---

## 🛠️ 5. Provocări Tehnice Rezolvate

1.  **Sincronizarea Filtrelor**: Am implementat o logică de filtrare "computată" care combină starea bazei de date cu timpul real al sistemului pentru a asigura acuratețea afișării (produsele expirate apar imediat la "Sold").
2.  **Stabilitatea Datelor**: Manipularea unui volum mare de mock-data în `DataContext` fără a sacrifica viteza de randare, folosind `useMemo` și `useCallback`.
3.  **Z-Index Management**: Rezolvarea conflictelor între elementele plutitoare (Chat Widget) și modalele de dashboard.

---

## 📚 6. Manual de Utilizare și Testare

Pentru instrucțiuni detaliate privind instalarea dependențelor și rularea proiectului (inclusiv serverul de WebSocket), te rugăm să consulți secțiunea **"8. Manual de Utilizare"** din fișierul principal [README.md](file:///d:/Proiect_WEB/artpulse-frontend/README.md).

---
*Proiect realizat pentru evaluarea de student Crîngașu Andreea-Gabriela, grupa C113D.*
