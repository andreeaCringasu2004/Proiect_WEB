import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { productService } from '../services/productService';
import { auctionService } from '../services/auctionService';
import { userService, mapBackendUser } from '../services/userService';
import { messageService } from '../services/messageService';
import { appointmentService } from '../services/appointmentService';
import { evaluationRequestService } from '../services/evaluationRequestService';
import { User } from './AuthContext';


export interface Product {
  id: number;
  title: string;
  description: string;
  sellerId: number;
  expertId: number | null;
  categoryId: number | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'sold';
  rejectionReason?: string;
  suggestedPrice?: number;
  images: string[];
  submittedAt: string;
  artist?: string;
  documents?: string[];
  category?: string;
  expertOpinion?: string;
  medium?: string;
  year?: number;
  dimensions?: string;
  provenance?: string;
}

export interface Appointment {
  id: number;
  productId: number;
  expertId: number;
  sellerId: number;
  date: string;
  location: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes: string;
}

export interface ChatMessage {
  id: number;
  productId: number;
  fromId: number;
  toId: number;
  text: string;
  time: string;
  documents?: string[];
  isDeleted?: boolean;
}

export interface EvalRequest {
  id: number;
  productId: number;
  sellerId: number;
  message: string;
  documents: string[];
  sentAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  acceptedByExpertId?: number;
}

export interface Bid {
  id: number;
  auctionId: number;
  bidder: string;
  bidderId?: number;
  amount: number;
  time: string;
}

export interface Auction {
  id: number;
  productId?: number;
  title: string;
  artist: string;
  category: string;
  image: string;
  currentBid: number;
  startingBid: number;
  endsAt: string;
  status: 'active' | 'upcoming' | 'sold';
  bidsCount: number;
  winnerName?: string;
  year?: number;
  medium?: string;
  dimensions?: string;
  condition?: string;
  provenance?: string;
  description?: string;
  sellerName?: string;
}

export interface DataContextType {
  users: User[];
  products: Product[];
  appointments: Appointment[];
  messages: ChatMessage[];
  auctions: Auction[];
  bids: Bid[];
  addUser: (u: User) => void;
  updateUserRole: (id: number, role: User['role']) => void;
  updateProduct: (p: Product) => void;
  addAppointment: (a: Appointment) => void;
  addMessage: (m: ChatMessage) => void;
  updateMessage: (id: number, updates: Partial<ChatMessage>) => void;
  getChatForProduct: (prodId: number) => ChatMessage[];
  placeBid: (auctionId: number, bidder: string, amount: number) => void;
  getBidsForAuction: (auctionId: number) => Bid[];
  updateAuctionStatus: (auctionId: number, status: Auction['status']) => void;
  purchasedIds: number[];
  markAsPurchased: (id: number) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setAuctions: React.Dispatch<React.SetStateAction<Auction[]>>;
  setBids: React.Dispatch<React.SetStateAction<Bid[]>>;
  evalRequests: EvalRequest[];
  addEvalRequest: (r: EvalRequest) => void;
  updateEvalRequest: (r: EvalRequest) => void;
  addProduct: (p: Product) => void;
  activeChatId: number;
  setActiveChatId: (id: number) => void;
  wsStatus: 'online' | 'offline';
}

// --- Initial Mock Data based on SQL ---
export const PREDEFINED_USERS: User[] = [
  { id: 100, email: 'admin@artpulse.com', name: 'Admin ArtPulse', role: 'admin' },
  { id: 101, email: 'expert1@artpulse.com', name: 'Elena Popa', role: 'expert' },
  { id: 102, email: 'expert2@artpulse.com', name: 'Andrei Ionescu', role: 'expert' },
  { id: 109, email: 'expert3@artpulse.com', name: 'Laura B.', role: 'expert' },
  { id: 103, email: 'seller1@artpulse.com', name: 'Ion Popescu', role: 'seller' },
  { id: 104, email: 'seller2@artpulse.com', name: 'Maria V.', role: 'seller' },
  { id: 108, email: 'seller3@artpulse.com', name: 'George M.', role: 'seller' },
  { id: 105, email: 'bidder1@artpulse.com', name: 'Bidder 1', role: 'bidder' },
  { id: 106, email: 'bidder2@artpulse.com', name: 'Bidder 2', role: 'bidder' },
  { id: 107, email: 'bidder3@artpulse.com', name: 'Bidder 3', role: 'bidder' },
  { id: 110, email: 'deleted1@artpulse.com', name: 'Deleted User 1', role: 'bidder', status: 'deleted' } as any,
  { id: 111, email: 'deleted2@artpulse.com', name: 'Deleted User 2', role: 'guest', status: 'deleted' } as any,
  { id: 112, email: 'deleted3@artpulse.com', name: 'Deleted User 3', role: 'seller', status: 'deleted' } as any,
  { id: 113, email: 'deleted4@artpulse.com', name: 'Deleted User 4', role: 'bidder', status: 'deleted' } as any,
  { id: 114, email: 'deleted5@artpulse.com', name: 'Deleted User 5', role: 'guest', status: 'deleted' } as any,
  { id: 115, email: 'suspended1@artpulse.com', name: 'Suspended User 1', role: 'bidder', status: 'suspended' } as any,
  { id: 116, email: 'suspended2@artpulse.com', name: 'Suspended User 2', role: 'seller', status: 'suspended' } as any
];

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 20, productId: 51, expertId: 101, sellerId: 103, date: new Date(Date.now() + 86400000).toISOString(), location: 'Sediu ArtPulse', status: 'SCHEDULED', notes: 'Aduceti toate certificatele.' }
];

const INITIAL_MESSAGES: ChatMessage[] = [];

const INITIAL_AUCTIONS: Auction[] = [
  { id: 1, title: 'Metallic Distortions', artist: 'Marie Leblanc', productId: 12, category: 'Painting', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', startingBid: 4200, currentBid: 4200, endsAt: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'active', bidsCount: 1, year: 2022, medium: 'Oil on Canvas', dimensions: '120 x 100 cm', condition: 'Excellent', provenance: 'Private Collection, Paris' },
  {
    id: 2, title: 'Solar Plexus', artist: 'Dante Ali', productId: 23, category: 'Sculpture', image:
      'data:image/jpeg;base64,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',
    startingBid: 8750, currentBid: 8750, endsAt: new Date(Date.now() + 27 * 3600000).toISOString(), status: 'active', bidsCount: 1, year: 2021, medium: 'Bronze', dimensions: '45 x 30 x 25 cm', condition: 'Stable', provenance: 'Direct from artist'
  },
  { id: 3, title: 'Tablou Abstract', artist: 'Ines Moreau', productId: 50, category: 'Abstract', image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80', startingBid: 1450, currentBid: 1450, endsAt: new Date(Date.now() + 10 * 3600000).toISOString(), status: 'active', bidsCount: 0, year: 2023, medium: 'Mixed Media', dimensions: '80 x 80 cm', condition: 'New', provenance: 'Studio Sale' },
  { id: 4, title: 'Ocean Breath', artist: 'Marco Rossi', productId: 15, category: 'Photography', image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=800&q=80', startingBid: 950, currentBid: 950, endsAt: new Date(Date.now() + 24 * 3600000).toISOString(), status: 'active', bidsCount: 0, year: 2024, medium: 'Giclée Print', dimensions: '60 x 90 cm', condition: 'Pristine' },
  { id: 5, title: 'Golden Hour', artist: 'Ama Diallo', productId: 14, category: 'Painting', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', startingBid: 3100, currentBid: 3200, endsAt: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'active', bidsCount: 1, year: 2023, medium: 'Acrylic on Linen', dimensions: '150 x 120 cm' },
  { id: 6, title: 'Midnight Canvas', artist: 'Arjun Mehta', productId: 13, category: 'Abstract', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', startingBid: 2300, currentBid: 2300, endsAt: new Date(Date.now() + 20 * 3600000).toISOString(), status: 'active', bidsCount: 0, year: 2023, medium: 'Oil and Sand' },
  { id: 7, title: 'Autumn in Paris', artist: 'Omar Faroq', productId: 11, category: 'Painting', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', startingBid: 1800, currentBid: 1800, endsAt: new Date(Date.now() - 3600000).toISOString(), status: 'sold', bidsCount: 4, winnerName: 'Bidder 1', year: 2020, medium: 'Silver Gelatin Print' },
  { id: 8, title: 'Urban Rhythm', artist: 'Leo Chen', productId: 16, category: 'Mixed Media', image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80', startingBid: 5600, currentBid: 5600, endsAt: new Date(Date.now() - 7200000).toISOString(), status: 'sold', bidsCount: 5, winnerName: 'Bidder 2', year: 2022 },
  { id: 9, title: 'Ethereal Glow', artist: 'Sarah Jenkins', productId: 17, category: 'Photography', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80', startingBid: 1200, currentBid: 1200, endsAt: new Date(Date.now() - 86400000).toISOString(), status: 'sold', bidsCount: 5, winnerName: 'Andreea C.', year: 2022 },
  { id: 10, title: 'Velvet Mountains', artist: 'Elena Popa', productId: 18, category: 'Painting', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85', startingBid: 3400, currentBid: 3400, endsAt: new Date(Date.now() + 0.05 * 3600000).toISOString(), status: 'active', bidsCount: 7, year: 2021 },
  { id: 11, title: 'Static Vibration', artist: 'Victor H.', productId: 19, category: 'Sculpture', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85', startingBid: 7100, currentBid: 7100, endsAt: new Date(Date.now() + 8 * 3600000).toISOString(), status: 'active', bidsCount: 24 },
  { id: 12, title: 'Emerald Dreams', artist: 'Nina Simone', productId: 20, category: 'Abstract', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=900&q=85', startingBid: 2800, currentBid: 2800, endsAt: new Date(Date.now() + 12 * 3600000).toISOString(), status: 'active', bidsCount: 5 },
  { id: 13, title: 'Cold Fusion', artist: 'Ivan Petroff', productId: 21, category: 'Sculpture', image: 'https://images.saatchiart.com/saatchi/1874890/art/8827728/7891102-HSC00923-7.jpg', startingBid: 15400, currentBid: 15400, endsAt: new Date(Date.now() + 1 * 3600000).toISOString(), status: 'active', bidsCount: 42 },
  { id: 14, title: 'Shattered Glass', artist: 'Chloe Bell', productId: 22, category: 'Mixed Media', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=900&q=85', startingBid: 4900, currentBid: 4900, endsAt: new Date(Date.now() + 24 * 3600000).toISOString(), status: 'active', bidsCount: 1 },
  { id: 15, title: 'Solar Plexus', artist: 'Dante Ali', productId: 23, category: 'Sculpture', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80', startingBid: 4500, currentBid: 6300, endsAt: new Date(Date.now() + 18 * 3600000).toISOString(), status: 'active', bidsCount: 3 },
  { id: 16, title: 'Horizon Echoes', artist: 'Luca Moretti', productId: 24, category: 'Painting', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=85', startingBid: 1200, currentBid: 1200, endsAt: new Date(Date.now() + 36 * 3600000).toISOString(), status: 'active', bidsCount: 0 },
  { id: 17, title: 'Urban Decay', artist: 'J. Banksy', productId: 25, category: 'Mixed Media', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPnFrbAPqp-oynIeQ7ekb3pTpn6GEUonnfdg&s', startingBid: 5000, currentBid: 5000, endsAt: new Date(Date.now() + 50 * 3600000).toISOString(), status: 'active', bidsCount: 0 },
  { id: 18, title: 'Floral Symphony', artist: 'Rose Miller', productId: 26, category: 'Painting', image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=900&q=85', startingBid: 800, currentBid: 800, endsAt: new Date(Date.now() + 120 * 3600000).toISOString(), status: 'upcoming', bidsCount: 0 },
  { id: 19, title: 'Obsidian Night', artist: 'Stefan Kunz', productId: 1019, category: 'Abstract', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80', startingBid: 2800, currentBid: 3200, endsAt: new Date(Date.now() + 72 * 3600000).toISOString(), status: 'upcoming', bidsCount: 0 },
  { id: 20, title: 'Velvet Dreams', artist: 'Ina G.', productId: 1020, category: 'Painting', image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=900&q=85', startingBid: 1200, currentBid: 1550, endsAt: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'upcoming', bidsCount: 0 }
];


const INITIAL_BIDS: Bid[] = [
  { id: 1, auctionId: 1, bidder: 'Collector ***42', amount: 4200, time: '3 min ago' },
  { id: 2, auctionId: 2, bidder: 'Collector ***09', amount: 8750, time: '1 min ago' },
  { id: 71, auctionId: 7, bidder: 'Collector ***11', amount: 1200, time: 'Yesterday 10:00' },
  { id: 72, auctionId: 7, bidder: 'Bidder 1', amount: 1400, time: 'Yesterday 10:15' },
  { id: 73, auctionId: 7, bidder: 'Collector ***11', amount: 1600, time: 'Yesterday 10:30' },
  { id: 74, auctionId: 7, bidder: 'Bidder 1', amount: 1800, time: 'Yesterday 10:45' },
  { id: 81, auctionId: 8, bidder: 'Bidder 2', amount: 3500, time: '2 days ago 14:00' },
  { id: 82, auctionId: 8, bidder: 'Collector ***22', amount: 4200, time: '2 days ago 14:20' },
  { id: 83, auctionId: 8, bidder: 'Bidder 2', amount: 4800, time: '2 days ago 14:40' },
  { id: 84, auctionId: 8, bidder: 'Collector ***22', amount: 5200, time: '2 days ago 15:00' },
  { id: 85, auctionId: 8, bidder: 'Bidder 2', amount: 5600, time: '2 days ago 15:30' },
  { id: 91, auctionId: 9, bidder: 'Andreea C.', amount: 600, time: 'Last week 09:00' },
  { id: 92, auctionId: 9, bidder: 'Collector ***99', amount: 850, time: 'Last week 10:00' },
  { id: 93, auctionId: 9, bidder: 'Andreea C.', amount: 1000, time: 'Last week 11:00' },
  { id: 94, auctionId: 9, bidder: 'Collector ***99', amount: 1100, time: 'Last week 12:00' },
  { id: 95, auctionId: 9, bidder: 'Andreea C.', amount: 1200, time: 'Last week 13:00' },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: 100 + i,
    auctionId: (i % 6) + 1,
    bidder: `Collector ***${Math.floor(Math.random() * 99)}`,
    amount: 1000 + (i * 100),
    time: `${i + 1}h ago`
  }))
];

const INITIAL_EVAL_REQUESTS: EvalRequest[] = [
  { id: 1, productId: 50, sellerId: 103, message: 'Buna ziua! As dori o evaluare urgenta pentru aceasta lucrare abstracta. Este o pictura veche din anii 90 si cred ca are valoare istorica.', documents: ['certificate_autenticitate.pdf', 'foto_spate.jpg', 'raport_restaurare.pdf'], sentAt: '2 hours ago', status: 'pending' },
  { id: 2, productId: 16, sellerId: 103, message: 'Va rog sa evaluati aceasta colaj urban. Lucrarea are o dimensiune mare (200x150cm) si contine materiale mixte.', documents: ['provenienta.pdf'], sentAt: '1 day ago', status: 'pending' },
  { id: 3, productId: 60, sellerId: 104, message: 'Buna ziua! Aceasta lucrare este o acuarela originala executata in 2023. Doresc o evaluare profesionista inainte de a o pune la licitatie.', documents: ['acuarela_certificat.pdf', 'foto_verso.jpg'], sentAt: '3 hours ago', status: 'pending' },
  { id: 4, productId: 61, sellerId: 104, message: 'Va rog sa evaluati aceasta pictura in ulei. Dimensiunile sunt 120x90cm si a fost expusa la o galerie locala in 2022.', documents: ['galerie_expozitie.pdf', 'contract_galerie.pdf', 'foto_expozitie.jpg'], sentAt: '1 day ago', status: 'pending' },
  { id: 5, productId: 62, sellerId: 103, message: 'Fotografie de natura realizata cu echipament profesional. Tiparita pe hartie de calitate muzeala. Va rog evaluati!', documents: ['spec_tehnice.pdf'], sentAt: '5 hours ago', status: 'pending' },
  { id: 6, productId: 63, sellerId: 108, message: 'Arta digitala generativa unica. NFT-ul corespunzator exista pe blockchain. Doresc o evaluare fizica a printului.', documents: ['nft_certificate.pdf', 'blockchain_proof.pdf', 'print_specs.jpg'], sentAt: '2 hours ago', status: 'pending' },
  { id: 7, productId: 64, sellerId: 103, message: 'Salut! Am gasit aceasta schita in pod. Nu sunt sigur de autor, dar pare de epoca.', documents: ['pod_gasire.jpg'], sentAt: '10 min ago', status: 'pending' },
  { id: 8, productId: 51, sellerId: 103, message: 'Cerere de re-evaluare dupa restaurare.', documents: ['restaurare_finala.pdf'], sentAt: '4 hours ago', status: 'accepted', acceptedByExpertId: 101 },
  { id: 9, productId: 11, sellerId: 103, message: 'Va rog reconsiderati respingerea.', documents: [], sentAt: '2 days ago', status: 'rejected' },
  { id: 10, productId: 70, sellerId: 103, message: 'Solicitare evaluare rapidă.', documents: [], sentAt: '5 min ago', status: 'pending' },
  { id: 11, productId: 71, sellerId: 104, message: 'Evaluare pentru fotografie alb-negru.', documents: [], sentAt: '15 min ago', status: 'pending' },
  { id: 12, productId: 72, sellerId: 104, message: 'Peisaj de toamnă târzie.', documents: [], sentAt: '25 min ago', status: 'pending' },
  { id: 13, productId: 12, sellerId: 103, message: 'Evaluat deja.', documents: [], sentAt: '1 week ago', status: 'accepted', acceptedByExpertId: 101 },
  { id: 14, productId: 17, sellerId: 108, message: 'Respins anterior.', documents: [], sentAt: '2 weeks ago', status: 'rejected' },
  { id: 15, productId: 73, sellerId: 108, message: 'Solicitare artist digital.', documents: [], sentAt: '35 min ago', status: 'pending' },
  { id: 16, productId: 60, sellerId: 104, message: 'Urgent!', documents: [], sentAt: 'Just now', status: 'pending' },
  { id: 17, productId: 70, sellerId: 103, message: 'Aștept răspuns.', documents: [], sentAt: 'Just now', status: 'pending' },
];

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inited, setInited] = useState(false);
  const [users, setUsers] = useState<User[]>(PREDEFINED_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [auctions, setAuctions] = useState<Auction[]>(INITIAL_AUCTIONS);
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS);
  const [purchasedIds, setPurchasedIds] = useState<number[]>([]);
  const [evalRequests, setEvalRequests] = useState<EvalRequest[]>(INITIAL_EVAL_REQUESTS);
  const [activeChatId, setActiveChatId] = useState<number>(-1);
  const [wsStatus, setWsStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    const lsUsers = localStorage.getItem('ap_users');
    // const lsProds = localStorage.getItem('ap_prods');
    const lsAppts = localStorage.getItem('ap_appts');
    const lsMsgs = localStorage.getItem('ap_msgs');
    const lsAuctions = localStorage.getItem('ap_auctions');
    const lsBids = localStorage.getItem('ap_bids');
    const lsPaid = localStorage.getItem('ap_purchased');

    if (lsUsers) {
      const parsed = JSON.parse(lsUsers);
      if (parsed.length < 17) {
        setUsers(PREDEFINED_USERS);
        localStorage.setItem('ap_users', JSON.stringify(PREDEFINED_USERS));
      } else {
        setUsers(parsed);
      }
    }
    // products are fetched from backend in a separate useEffect
    if (lsAppts) setAppointments(JSON.parse(lsAppts));
    if (lsMsgs) setMessages(JSON.parse(lsMsgs));
    if (lsAuctions) {
      const a = JSON.parse(lsAuctions);
      if (a.length < 21) {
        setAuctions(INITIAL_AUCTIONS);
        localStorage.setItem('ap_auctions', JSON.stringify(INITIAL_AUCTIONS));
      } else {
        setAuctions(a);
      }
    }
    if (lsBids) setBids(JSON.parse(lsBids));
    if (lsPaid) setPurchasedIds(JSON.parse(lsPaid));
    const lsEvalReqs = localStorage.getItem('ap_eval_requests');
    if (lsEvalReqs) {
      const er = JSON.parse(lsEvalReqs);
      if (er.length < 17) {
        setEvalRequests(INITIAL_EVAL_REQUESTS);
        localStorage.setItem('ap_eval_requests', JSON.stringify(INITIAL_EVAL_REQUESTS));
      } else {
        setEvalRequests(er);
      }
    }
    setInited(true);
  }, []);

  // ─── Load from backend (with mock fallback) ────────────────────────────
  useEffect(() => {
    // Products
    productService.getAllProducts().then(data => {
      if (data && data.length > 0) setProducts(data);
    }).catch(err => console.warn('Backend products unavailable, using mock:', err));

    // Auctions
    auctionService.getAllAuctions().then(data => {
      if (data && data.length > 0) {
        // Normalize endsAt: backend returns LocalDateTime without Z suffix
        const normalized = data.map((a: any) => ({
          ...a,
          currentBid: a.currentBid ?? a.startingBid,
          endsAt: a.endsAt
            ? (a.endsAt.endsWith('Z') ? a.endsAt : a.endsAt + 'Z')
            : new Date(Date.now() + 86400000).toISOString(),
        }));
        setAuctions(normalized);
        localStorage.setItem('ap_auctions', JSON.stringify(normalized));
      }
    }).catch(err => console.warn('Backend auctions unavailable, using mock:', err));

    // Users (admin only — may fail for non-admins, that is fine)
    const userStr = localStorage.getItem('user_info');
    let isAdmin = false;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && u.role && u.role.toLowerCase() === 'admin') {
          isAdmin = true;
        }
      } catch (e) {}
    }

    if (isAdmin) {
      userService.getAllUsers().then(data => {
        if (data && data.length > 0) {
          const mapped = data.map(mapBackendUser);
          setUsers(mapped as User[]);
          localStorage.setItem('ap_users', JSON.stringify(mapped));
        }
      }).catch(() => { /* non-admin — skip, keep PREDEFINED_USERS */ });
    }

    // Messages
    messageService.getAllMessages().then(data => {
      if (data && data.length > 0) {
        setMessages(data);
        localStorage.setItem('ap_msgs', JSON.stringify(data));
      }
    }).catch(err => console.warn('Backend messages unavailable, using mock:', err));

    // Appointments
    appointmentService.getAppointments().then(data => {
      if (data && data.length > 0) {
        setAppointments(data);
        localStorage.setItem('ap_appts', JSON.stringify(data));
      }
    }).catch(err => console.warn('Backend appointments unavailable, using mock:', err));

    // Evaluation Requests
    evaluationRequestService.getAllRequests().then(data => {
      if (data && data.length > 0) {
        setEvalRequests(data);
        localStorage.setItem('ap_eval_requests', JSON.stringify(data));
      }
    }).catch(err => console.warn('Backend evaluation requests unavailable, using mock:', err));

    // Bids
    auctionService.getAllBids().then(data => {
      if (data && data.length > 0) {
        setBids(data);
        localStorage.setItem('ap_bids', JSON.stringify(data));
      }
    }).catch(err => console.warn('Backend bids unavailable, using mock:', err));
  }, []);

  useEffect(() => {
    if (!inited) return;
    localStorage.setItem('ap_users', JSON.stringify(users));
    // localStorage.setItem('ap_prods', JSON.stringify(products));
    localStorage.setItem('ap_appts', JSON.stringify(appointments));
    localStorage.setItem('ap_msgs', JSON.stringify(messages));
    localStorage.setItem('ap_auctions', JSON.stringify(auctions));
    localStorage.setItem('ap_bids', JSON.stringify(bids));
    localStorage.setItem('ap_purchased', JSON.stringify(purchasedIds));
    localStorage.setItem('ap_eval_requests', JSON.stringify(evalRequests));
  }, [users, products, appointments, messages, auctions, bids, purchasedIds, evalRequests, inited]);


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let changed = false;
      const updatedAuctions = auctions.map(a => {
        const endTime = new Date(a.endsAt).getTime();
        if (a.status === 'active' && now > endTime) {
          changed = true;
          if (a.bidsCount > 0) {
            return { ...a, status: 'sold' as const };
          } else {
            return {
              ...a,
              status: 'upcoming' as const,
              endsAt: new Date(now + 86400000).toISOString()
            };
          }
        }
        return a;
      });

      if (changed) {
        setAuctions(updatedAuctions);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [auctions, inited]);

  // Simulated Live Bidding (Socket Mock)
  useEffect(() => {
    if (!inited) return;
    const botInterval = setInterval(() => {
      setAuctions(prev => {
        const active = prev.filter(a => a.status === 'active');
        if (active.length === 0) return prev;
        const randomAuction = active[Math.floor(Math.random() * active.length)];
        const newBidAmount = randomAuction.currentBid + Math.floor(Math.random() * 5 + 1) * 100;
        const newBidder = `Collector ***${Math.floor(Math.random() * 90) + 10}`;
        
        const newBid = { id: Date.now(), auctionId: randomAuction.id, bidder: newBidder, amount: newBidAmount, time: 'Just now' };
        setBids(b => [newBid, ...b]);
        
        return prev.map(a => a.id === randomAuction.id ? { ...a, currentBid: newBidAmount, bidsCount: a.bidsCount + 1 } : a);
      });
    }, 1800000); // 30 minutes
    return () => clearInterval(botInterval);
  }, [inited]);

  useEffect(() => {
    if (products.length === 0 || auctions.length === 0) return;
    
    let needsUpdate = false;
    for (const p of products) {
      const auction = auctions.find(a => a.productId === p.id);
      if (auction) {
        if (auction.status === 'active' && p.status !== 'LIVE') {
          needsUpdate = true;
          break;
        }
        if (auction.status === 'sold' && p.status !== 'sold') {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      setProducts(prev => prev.map(p => {
        const auction = auctions.find(a => a.productId === p.id);
        if (auction) {
          if (auction.status === 'active' && p.status !== 'LIVE') {
            return { ...p, status: 'LIVE' };
          }
          if (auction.status === 'sold' && p.status !== 'sold') {
            return { ...p, status: 'sold' };
          }
        }
        return p;
      }));
    }
  }, [auctions, products]);

  const ws = useRef<WebSocket | null>(null);
  const wsReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectWebSocket = () => {
    try {
      if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
        return; // Already connected or connecting
      }
      const socket = new WebSocket('ws://localhost:8081');
      ws.current = socket;

      socket.onopen = () => {
        setWsStatus('online');
        if (wsReconnectTimer.current) {
          clearTimeout(wsReconnectTimer.current);
          wsReconnectTimer.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'DATA_CHAT_MSG') {
            setMessages(prev => prev.some(m => m.id === parsed.payload.id) ? prev : [...prev, parsed.payload]);
          }
          if (parsed.type === 'DATA_CHAT_MSG_UPDATE') {
            const { id, updates } = parsed.payload;
            setMessages(prev => {
              const ms = prev.map(m => m.id === id ? { ...m, ...updates } : m);
              localStorage.setItem('ap_msgs', JSON.stringify(ms));
              return ms;
            });
          }
          if (parsed.type === 'DATA_BID') {
            setBids(prev => prev.some(b => b.id === parsed.payload.id) ? prev : [parsed.payload, ...prev]);
            setAuctions(prev => prev.map(a => a.id === parsed.payload.auctionId ? { ...a, currentBid: parsed.payload.amount, bidsCount: a.bidsCount + 1 } : a));
          }
        } catch { /* ignore malformed messages */ }
      };

      socket.onclose = () => {
        setWsStatus('offline');
        // Auto-reconnect after 3 seconds
        wsReconnectTimer.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      socket.onerror = () => {
        setWsStatus('offline');
        socket.close(); // triggers onclose → reconnect
      };
    } catch { /* ignore connection errors */ }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsReconnectTimer.current) clearTimeout(wsReconnectTimer.current);
      ws.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addUser = (u: User) => setUsers(p => [...p, u]);
  const updateUserRole = (id: number, role: User['role']) => setUsers(p => p.map(x => x.id === id ? { ...x, role } : x));
  const updateProduct = (p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    
    // Propagate product updates to the frontend auctions list immediately
    setAuctions(prev => prev.map(a => {
      if (a.productId === p.id) {
        return {
          ...a,
          title: p.title,
          artist: p.artist || a.artist,
          category: p.category || a.category,
          image: p.images?.[0] || a.image,
          year: p.year || a.year,
          medium: p.medium || a.medium,
          dimensions: p.dimensions || a.dimensions,
          condition: p.expertOpinion || a.condition,
          provenance: p.provenance || a.provenance,
          description: p.description || a.description
        };
      }
      return a;
    }));

    productService.updateProduct(p.id, p).then(saved => {
      setProducts(prev => prev.map(x => x.id === p.id ? saved : x));
      // Re-propagate saved product state from backend to matching auction
      setAuctions(prev => prev.map(a => {
        if (a.productId === saved.id) {
          return {
            ...a,
            title: saved.title,
            artist: saved.artist || a.artist,
            category: saved.category || a.category,
            image: saved.images?.[0] || a.image,
            year: saved.year || a.year,
            medium: saved.medium || a.medium,
            dimensions: saved.dimensions || a.dimensions,
            condition: saved.expertOpinion || a.condition,
            provenance: saved.provenance || a.provenance,
            description: saved.description || a.description
          };
        }
        return a;
      }));
    }).catch(err => {
      console.warn('Failed to update product on backend:', err);
    });
  };
  const addAppointment = (a: Appointment) => {
    setAppointments(p => [...p, a]);
    appointmentService.createAppointment({
      productId: a.productId,
      expertId: a.expertId,
      sellerId: a.sellerId,
      date: a.date,
      location: a.location,
      status: a.status,
      notes: a.notes
    }).then(saved => {
      setAppointments(prev => prev.map(x => x.id === a.id ? saved : x));
    }).catch(err => {
      console.warn('Failed to save appointment to backend:', err);
    });
  };
  const addMessage = (m: ChatMessage) => {
    messageService.createMessage({
      productId: m.productId,
      fromId: m.fromId,
      toId: m.toId,
      text: m.text,
      documents: m.documents || []
    }).then(saved => {
      setMessages(prev => prev.map(msg => msg.id === m.id ? saved : msg));
    }).catch(err => {
      console.warn('Failed to save message to backend:', err);
    });

    setMessages(prev => {
      if (prev.some(x => x.id === m.id)) return prev;
      const ms = [...prev, m];
      localStorage.setItem('ap_msgs', JSON.stringify(ms));
      return ms;
    });
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'DATA_CHAT_MSG', payload: m }));
    }
  };

  const updateMessage = (id: number, updates: Partial<ChatMessage>) => {
    messageService.updateMessage(id, updates).catch(err => {
      console.warn('Failed to update message on backend:', err);
    });

    setMessages(prev => {
      const ms = prev.map(m => m.id === id ? { ...m, ...updates } : m);
      localStorage.setItem('ap_msgs', JSON.stringify(ms));
      return ms;
    });

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'DATA_CHAT_MSG_UPDATE', payload: { id, updates } }));
    }
  };

  const getChatForProduct = (prodId: number) => messages.filter(m => m.productId === prodId);
  const placeBid = (auctionId: number, bidder: string, amount: number) => {
    const userStr = localStorage.getItem('user_info');
    let userId: number | undefined;
    if (userStr) {
      try {
        userId = JSON.parse(userStr)?.id;
      } catch (e) {}
    }
    const newBid: Bid = { id: Date.now(), auctionId, bidder, bidderId: userId, amount, time: 'Just now' };
    setBids(prev => [newBid, ...prev]);
    setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, currentBid: amount, bidsCount: a.bidsCount + 1 } : a));
    // Call backend API
    auctionService.placeBid(auctionId, amount).then(res => {
      if (res && res.bid) {
        const savedBid: Bid = {
          id: res.bid.id,
          auctionId: res.bid.auctionId,
          bidder: res.bid.bidder,
          bidderId: res.bid.bidderId,
          amount: res.bid.amount,
          time: res.bid.time || 'Just now'
        };
        setBids(prev => prev.map(b => b.id === newBid.id ? savedBid : b));
      }
    }).catch(err => {
      console.warn('Backend bid failed (local state already updated):', err);
    });
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'DATA_BID', payload: newBid }));
    }
  };

  return (
    <DataContext.Provider value={{
      users, products, appointments, messages, auctions, bids,
      addUser, updateUserRole, updateProduct, addAppointment, addMessage, updateMessage,
      getChatForProduct,
      placeBid,
      getBidsForAuction: id => bids.filter(b => b.auctionId === id),
      updateAuctionStatus: (id, status) => {
        setAuctions(p => p.map(a => a.id === id ? { ...a, status } : a));
        if (status === 'active') {
          auctionService.startAuction(id).catch(err => console.warn('Failed to start auction on backend:', err));
        } else if (status === 'sold') {
          auctionService.closeAuction(id).catch(err => console.warn('Failed to close auction on backend:', err));
        }
      },
      purchasedIds,
      markAsPurchased: id => {
        if (!purchasedIds.includes(id)) setPurchasedIds(p => [...p, id]);
      },
      setUsers,
      setAuctions,
      setBids,
      evalRequests,
      addEvalRequest: (r: EvalRequest) => {
        setEvalRequests(p => [...p, r]);
        evaluationRequestService.createRequest(r).then(saved => {
          setEvalRequests(prev => prev.map(x => x.id === r.id ? saved : x));
        }).catch(err => {
          console.warn('Failed to save evaluation request to backend:', err);
        });
      },
      updateEvalRequest: (r: EvalRequest) => {
        setEvalRequests(p => p.map(x => x.id === r.id ? r : x));
        evaluationRequestService.updateRequest(r).then(saved => {
          setEvalRequests(prev => prev.map(x => x.id === r.id ? saved : x));
        }).catch(err => {
          console.warn('Failed to update evaluation request on backend:', err);
        });
      },
      addProduct: (p: Product) => {
        setProducts(prev => [p, ...prev]);
        productService.createProduct(p).then(saved => {
          setProducts(prev => prev.map(x => x.id === p.id ? saved : x));
        }).catch(err => {
          console.warn('Failed to save product to backend:', err);
        });
      },
      activeChatId,
      setActiveChatId,
      wsStatus
    }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData error');
  return ctx;
};
