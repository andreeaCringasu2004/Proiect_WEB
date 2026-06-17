import apiClient from '../api/apiClient';
import { Auction, Bid } from '../context/DataContext';

// Shape returned by backend AuctionDTO — matches frontend Auction interface
export const auctionService = {

  // GET /api/auctions — toate licitatiile (active + upcoming + sold)
  getAllAuctions: async (): Promise<Auction[]> => {
    const response = await apiClient.get<Auction[]>('/auctions');
    return response.data;
  },

  // GET /api/auctions/active — doar licitatii ACTIVE
  getActiveAuctions: async (): Promise<Auction[]> => {
    const response = await apiClient.get<Auction[]>('/auctions/active');
    return response.data;
  },

  // GET /api/auctions/{id} — detalii licitatie
  getAuctionById: async (id: number): Promise<Auction> => {
    const response = await apiClient.get<Auction>(`/auctions/${id}`);
    return response.data;
  },

  // GET /api/auctions/{id}/bids — ofertele pentru o licitatie
  getBidsForAuction: async (id: number): Promise<Bid[]> => {
    const response = await apiClient.get<any[]>(`/auctions/${id}/bids`);
    // Map backend BidDTO to frontend Bid interface
    return response.data.map((b: any) => ({
      id: b.id,
      auctionId: b.auctionId,
      bidder: b.bidder,
      amount: b.amount,
      time: b.time || 'N/A',
    }));
  },

  // POST /api/auctions/{id}/bid — plaseaza o oferta (necesita autentificare)
  placeBid: async (auctionId: number, amount: number): Promise<any> => {
    const response = await apiClient.post(`/auctions/${auctionId}/bid`, { amount });
    return response.data;
  },

  // PUT /api/auctions/{id}/close — incheie o licitatie manual (ADMIN)
  closeAuction: async (id: number): Promise<void> => {
    await apiClient.put(`/auctions/${id}/close`);
  },

  // PUT /api/auctions/{id}/start — activeaza o licitatie (ADMIN/SELLER)
  startAuction: async (id: number): Promise<void> => {
    await apiClient.put(`/auctions/${id}/start`);
  },

  // GET /api/auctions/bids — toate ofertele din sistem
  getAllBids: async (): Promise<Bid[]> => {
    const response = await apiClient.get<any[]>('/auctions/bids');
    return response.data.map((b: any) => ({
      id: b.id,
      auctionId: b.auctionId,
      bidder: b.bidder,
      bidderId: b.bidderId,
      amount: b.amount,
      time: b.time || 'N/A',
    }));
  }
};
