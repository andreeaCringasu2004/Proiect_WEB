import React, { useState } from 'react';
import './PaymentModal.css';

interface PaymentModalProps {
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const handleCardNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Numbers only
    if (val.length <= 16) setCardNum(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Numbers only
    
    // Auto-insert /
    if (val.length >= 2) {
      const month = val.slice(0, 2);
      const mInt = parseInt(month, 10);
      if (mInt < 1 || mInt > 12) {
        setError('Month must be 01-12');
      } else {
        setError('');
      }
      val = month + (val.length > 2 ? '/' + val.slice(2, 4) : '');
    }
    
    if (val.length <= 5) setExpiry(val);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) setCvc(val);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (expiry.length < 5) return setError('Complete expiry date (MM/YY)');
    const month = parseInt(expiry.split('/')[0], 10);
    if (month < 1 || month > 12) return setError('Invalid month');

    setLoading(true);
    setError('');
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="pm-overlay animate-fade-in" onClick={onClose}>
      <div className="pm-window animate-fade-up" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>✕</button>
        
        <header className="pm-header">
          <div className="pm-icon">💳</div>
          <h2 className="pm-title">Complete Your Purchase</h2>
          <p className="pm-subtitle">ArtPulse Secure Checkout</p>
        </header>

        <div className="pm-summary">
          <div className="pm-summary-row">
            <span>Winning Bid</span>
            <span>€{amount.toLocaleString()}</span>
          </div>
          <div className="pm-summary-row">
            <span>Buyer's Premium (15%)</span>
            <span>€{(amount * 0.15).toLocaleString()}</span>
          </div>
          <div className="pm-summary-row pm-summary-row--total">
            <span>Total to Pay</span>
            <span>€{(amount * 1.15).toLocaleString()}</span>
          </div>
        </div>

        <form className="pm-form" onSubmit={handlePay}>
          {error && <div className="pm-error-msg">{error}</div>}
          
          <div className="pm-field">
            <label>Cardholder Name</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          <div className="pm-field">
            <label>Card Number</label>
            <input 
              type="text" 
              placeholder="1234 5678 1234 5678" 
              value={cardNum}
              onChange={handleCardNumChange}
              required 
            />
          </div>
          <div className="pm-row">
            <div className="pm-field">
              <label>Expiry</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                value={expiry}
                onChange={handleExpiryChange}
                required 
              />
            </div>
            <div className="pm-field">
              <label>CVC</label>
              <input 
                type="text" 
                placeholder="***" 
                value={cvc}
                onChange={handleCvcChange}
                required 
              />
            </div>
          </div>

          <button className="pm-submit" disabled={loading || !!error}>
            {loading ? <div className="pm-spinner" /> : `Pay €${(amount * 1.15).toLocaleString()} Now`}
          </button>
        </form>

        <footer className="pm-footer">
          🔒 Your payment information is encrypted and secure.
        </footer>
      </div>
    </div>
  );
};

export default PaymentModal;
