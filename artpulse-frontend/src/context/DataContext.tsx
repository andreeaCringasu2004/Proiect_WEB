import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './AuthContext';

// --- Types ---

export interface Product {
  id: number;
  title: string;
  description: string;
  sellerId: number;
  expertId: number | null;
  categoryId: number | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  suggestedPrice?: number;
  images: string[];
  submittedAt: string;
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
}

export interface DataContextType {
  users: User[];
  products: Product[];
  appointments: Appointment[];
  messages: ChatMessage[];
  addUser: (u: User) => void;
  updateUserRole: (id: number, role: User['role']) => void;
  updateProduct: (p: Product) => void;
  addAppointment: (a: Appointment) => void;
  addMessage: (m: ChatMessage) => void;
  getChatForProduct: (prodId: number) => ChatMessage[];
}

// --- Initial Mock Data based on SQL ---
export const PREDEFINED_USERS: User[] = [
  { id: 100, email: 'admin@artpulse.com', name: 'Admin General', role: 'admin' },
  { id: 101, email: 'expert1@artpulse.com', name: 'Evaluator Principal (Exp 1)', role: 'expert' },
  { id: 102, email: 'expert2@artpulse.com', name: 'Evaluator Secundar (Exp 2)', role: 'expert' },
  { id: 103, email: 'seller1@artpulse.com', name: 'Galerie Arta (Seller 1)', role: 'seller' },
  { id: 104, email: 'seller2@artpulse.com', name: 'Colectionar Privat (Seller 2)', role: 'seller' },
  { id: 105, email: 'bidder1@artpulse.com', name: 'Andrei Cumparator (Bid 1)', role: 'bidder' },
  { id: 106, email: 'bidder2@artpulse.com', name: 'Elena Licitator (Bid 2)', role: 'bidder' }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 50, title: 'Tablou Abstract', description: 'O pictura moderna din anii 90', sellerId: 103, expertId: null, categoryId: null, status: 'PENDING', submittedAt: '1 day ago', images: ['https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80'] },
  { id: 51, title: 'Peisaj de Toamna', description: 'Prezinta usoare semne de decolorare', sellerId: 103, expertId: 101, categoryId: null, status: 'UNDER_REVIEW', submittedAt: '2 days ago', images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80'] }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 20, productId: 51, expertId: 101, sellerId: 103, date: new Date(Date.now() + 86400000).toISOString(), location: 'Sediu ArtPulse', status: 'SCHEDULED', notes: 'Aduceti toate certificatele.' }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 30, productId: 51, fromId: 103, toId: 101, text: 'Buna ziua, ati primit cererea mea?', time: '10:00 AM' },
  { id: 31, productId: 51, fromId: 101, toId: 103, text: 'Da, tocmai v-am programat. Va convine data?', time: '10:15 AM' }
];

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inited, setInited] = useState(false);
  const [users, setUsers] = useState<User[]>(PREDEFINED_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  // Load from local storage
  useEffect(() => {
    const lsUsers = localStorage.getItem('ap_users');
    const lsProds = localStorage.getItem('ap_prods');
    const lsAppts = localStorage.getItem('ap_appts');
    const lsMsgs = localStorage.getItem('ap_msgs');
    if (lsUsers) setUsers(JSON.parse(lsUsers));
    if (lsProds) setProducts(JSON.parse(lsProds));
    if (lsAppts) setAppointments(JSON.parse(lsAppts));
    if (lsMsgs) setMessages(JSON.parse(lsMsgs));
    setInited(true);

    // Simulated refresh across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ap_msgs' && e.newValue) setMessages(JSON.parse(e.newValue));
      if (e.key === 'ap_prods' && e.newValue) setProducts(JSON.parse(e.newValue));
      if (e.key === 'ap_appts' && e.newValue) setAppointments(JSON.parse(e.newValue));
      if (e.key === 'ap_users' && e.newValue) setUsers(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save changes
  useEffect(() => {
    if (!inited) return; // Prevent overwriting with initial state before load
    localStorage.setItem('ap_users', JSON.stringify(users));
    localStorage.setItem('ap_prods', JSON.stringify(products));
    localStorage.setItem('ap_appts', JSON.stringify(appointments));
    localStorage.setItem('ap_msgs', JSON.stringify(messages));
  }, [users, products, appointments, messages, inited]);

  const addUser = (u: User) => setUsers(p => [...p, u]);
  const updateUserRole = (id: number, role: User['role']) => setUsers(p => p.map(x => x.id === id ? { ...x, role } : x));
  const updateProduct = (p: Product) => setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  const addAppointment = (a: Appointment) => setAppointments(p => [...p, a]);
  const addMessage = (m: ChatMessage) => setMessages(p => [...p, m]);
  const getChatForProduct = (prodId: number) => messages.filter(m => m.productId === prodId);

  return (
    <DataContext.Provider value={{ users, products, appointments, messages, addUser, updateUserRole, updateProduct, addAppointment, addMessage, getChatForProduct }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
