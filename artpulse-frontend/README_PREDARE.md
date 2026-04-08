# Ghid de Evaluare și Prezentare - ArtPulse (Tema Front-End)

Bine ați venit! Acest proiect prezintă funcționalitățile complete de Front-End ale platformei ArtPulse.
Pentru flexibilitate și o notare rapidă, a fost integrat un **DataContext** ce simulează memorie locală (Local Storage) – astfel, veți putea testa curgerea reală a datelor (chat, licitații, categorisiri, programări) *fără a necesita vreo bază de date MySQL sau backend instalat momentan!*

---

## 🌟 1. Elemente de Originalitate și Contribuții Personale

Pe lângă cerințele de bază, acest proiect include multiple funcționalități extra și elemente de arhitectură care îl fac mai deosebit:

1. **State Management Global & Reactiv**: Un sistem robust (`DataContext`) care simulează o bază de date completă direct în browser. Orice modificare (trimiterea unui mesaj, programarea unui eveniment, editarea unui watchlist) se propagă instant între tab-urile browserului (via Storage Event Listeners).

2. **Sistem Multi-Rol Interconectat (5 Roluri)**: Guest, Bidder, Seller, Expert, Admin. Navigarea, rutele protejate și modulele vizibile se adaptează strict la setările de securitate aplicate pe contextul curent.

3. **Chat Live Interactiv (Expert <-> Seller)**: Un modul de chat cu răspunsuri simulate și „Quick Replies”. Notificările și mesajele de sistem (ex. invitațiile de vizionare fizică a operei) apar direct în conversație! Funcționează imediat între 2 tab-uri diferite cu roluri diferite (Expert și Seller).

4. **Programări Calendaristice Global-Sincronizate**: Experții pot stabili data și locul evaluărilor fizice pe lucrări. Această decizie trimite imediat o invitație în Chat-ul vânzătorului și populează un Tabel Calendaristic vizibil Administratorului.

5. **Autentificare "One-Click"**: Pentru o evaluare ultra-rapidă, pagina de Login are „Conturi Demo” pre-completate. Cu un singur click te pui în pielea oricărui rol.

6. **Notificări "Live" și Timere Precise**: Sistem avansat care monitorizează secundă de secundă licitațiile active (pe pagina de Watchlist) emitând alerte vizuale Toast la `T-10 mins` și `T-5 mins`. Toate timerele din paginile principale se calculează continuu, nefiind doar un design static.

---

## ✅ 2. Cum să porniți proiectul

Tot ce trebuie să faceți este să rulați comenzile standard din terminal în directorul `artpulse-frontend`:

```bash
npm install
npm start
```
Aplicația se va deschide automat în browser la adresa `http://localhost:3000`.

---

## 🗺️ 3. Pași de Navigare în Aplicație (Tur de Orizont)

Aplicația este vastă. Pentru a vizualiza cele mai bune mecanici create, vă recomandăm să deschideți **3 tab-uri separate (sau browsere)** și să folosiți Conturile Demo din secțiunea de Login:
1. **Tab 1: Seller** (`seller1@artpulse.com`)
2. **Tab 2: Expert** (`expert1@artpulse.com`)
3. **Tab 3: Admin** (`admin@artpulse.com`)

Deoarece folosim *Storage Listeners*, acțiunile făcute într-un tab se vor reflecta imediat în celălalt! Iată pașii de navigare (scenarii clare) de urmat:

### A: Experiența de Cumpărător / Vizitator (Home & Auctions)
- Răsfoiți **Pagina de Acasă**, secțiunea cu slideshow-ul generat automat.
- Navigați la **Auctions** (meniul de sus): previzualizați numărătoarea inversă pentru licitațiile active (countdown live) cu o interfață clară de filtrare.
- Analizați galeria foto auto-rotativă de la **Categories**. Funcționează pe timer și hover.

### B: Fluxul de Gestionare a Vânzării & Chat cu Expertul (Seller + Expert)
- Pe tab-ul de **Seller**, produsul „Peisaj de Toamna” are status: *Pending Expert Review*. Butonul de *Launch Auction* este intenționat parcat. Apăsați butonul **Chat Expert** și folosiți butoanele „Quick Replies” pentru a cere detalii.
- Treceți pe tab-ul de **Expert**, selectați lucrarea din panoul de jos și mergeți pe tab-ul "💬 Chat with Seller" din interfață. Veți vedea conversația preluată din celălalt colț al aplicației! 

### C: Sistemul de Evaluare și Calendare (Expert + Admin)
- Tot pe rolul de **Expert**, în secțiunea aceleiași lucrări, defilați un pic spre formularul _"Schedule Physical Evaluation"_. Alegeți o dată/locație oarecare și salvați. (Mergeți pe Seller să vedeți notificarea în chat!).
- Accesați contul de **Admin** în al treilea tab. Navigați în stânga la **📅 Expert Calendars**. Veți constata că sesiunea tocmai setată a ajuns în mod global în panoul administratorilor.

### D: Categorisirea Lucrării
- Reîntors pe **Expert**, la lucrarea „Peisaj de Toamna”, selectați o categorie din dropdown și aprobați (`✓ Categorise & Approve`).
- Seller-ul va avea automat produsul actualizat cu noul status, pregătit de licitație (`Marketplace`).

Vă mulțumesc pentru vizionare și timpul alocat evaluării acestui proiect! (Comenzile de creare DB sunt regăsite în `populate_database.sql`).
