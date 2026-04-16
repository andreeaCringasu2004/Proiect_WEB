import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TermsPage.css';

const TermsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const tab = query.get('tab') || 'terms';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  return (
    <main className="terms-page container" style={{ position: 'relative' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
        <span>←</span> Back
      </button>
      <div className="terms-content">
        {tab === 'terms' ? (
          <>
            <h1>Terms & Conditions</h1>
            <p className="terms-date">Last updated: April 11, 2026</p>
        
        <h2>1. Introduction</h2>
        <p>
          Welcome to ArtPulse. These Terms & Conditions govern your use of the ArtPulse platform, including the bidding, selling, and expert evaluation services. By accessing or using our platform, you agree to be bound by these Terms.
        </p>
        
        <h2>2. Bidding & Auctions</h2>
        <p>
          All bids placed on ArtPulse are legally binding. When an auction ends and you are the highest bidder, you are obligated to complete the transaction and pay the final amount, including any applicable Buyer's Premium (typically 15%) and taxes.
        </p>

        <h2>3. Selling & Consignments</h2>
        <p>
          Sellers must provide accurate descriptions and authentic works. All submitted items are subject to review by an ArtPulse Expert Evaluator. If an item is selected, the seller agrees to our commission structure upon successful sale.
        </p>
          </>
        ) : (
          <>
            <h1>Privacy Policy</h1>
            <p className="terms-date">Last updated: April 11, 2026</p>

        <h2>1. Data Collection</h2>
        <p>
          We collect personal information such as your name, email address, payment details, and bidding history to provide a secure and personalized auction experience. 
        </p>
        
            <h2>2. Security</h2>
            <p>
              Your data is protected with industry-standard encryption. Payment processing is handled securely by our third-party provider (Stripe). We do not sell your personal data to third parties.
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default TermsPage;
