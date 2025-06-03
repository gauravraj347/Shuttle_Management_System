import React, { useState } from 'react';
import { walletApi } from '../services/api';

const RechargeWallet = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: amount selection, 2: payment details, 3: confirmation
  
  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankAccount: '',
    ifscCode: ''
  });

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value
    });
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      // Validate payment details
      if (paymentMethod === 'creditCard') {
        if (!paymentDetails.cardNumber || !paymentDetails.cardHolder || !paymentDetails.expiryDate || !paymentDetails.cvv) {
          setError('Please fill in all card details');
          return;
        }
      } else if (paymentMethod === 'upi') {
        if (!paymentDetails.upiId) {
          setError('Please enter UPI ID');
          return;
        }
      } else if (paymentMethod === 'bankTransfer') {
        if (!paymentDetails.bankAccount || !paymentDetails.ifscCode) {
          setError('Please enter bank details');
          return;
        }
      }
      
      setError(null);
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await walletApi.rechargeWallet({
        amount: parseFloat(amount),
        paymentMethod,
        paymentDetails
      });
      
      if (response.data.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Reset the form
        setAmount('');
        setPaymentMethod('creditCard');
        setPaymentDetails({
          cardNumber: '',
          cardHolder: '',
          expiryDate: '',
          cvv: '',
          upiId: '',
          bankAccount: '',
          ifscCode: ''
        });
        setStep(1);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick amount options
  const predefinedAmounts = [50, 100, 200, 500];

  const renderStepOne = () => (
    <>
      <div className="mb-4">
        <label htmlFor="amount" className="form-label">Recharge Amount (Points)</label>
        <div className="input-group">
          <span className="input-group-text">₹</span>
          <input
            type="number"
            className="form-control"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            min="0"
            placeholder="Enter amount"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="form-label">Quick Select</label>
        <div className="d-flex flex-wrap gap-2">
          {predefinedAmounts.map(amt => (
            <button
              key={amt}
              type="button"
              className={`btn ${amount === amt.toString() ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setAmount(amt.toString())}
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="form-label">Payment Method</label>
        
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            id="upi"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={handlePaymentMethodChange}
          />
          <label className="form-check-label" htmlFor="upi">
            UPI
          </label>
        </div>
        
      </div>
      
      <div className="d-grid">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNextStep}
          disabled={loading}
        >
          Continue to Payment
        </button>
      </div>
    </>
  );

  const renderStepTwo = () => (
    <>
      {paymentMethod === 'upi' && (
        <div className="upi-payment">
          <div className="mb-3">
            <label htmlFor="upiId" className="form-label">UPI ID</label>
            <input
              type="text"
              className="form-control"
              id="upiId"
              name="upiId"
              value={paymentDetails.upiId}
              onChange={handlePaymentDetailsChange}
              placeholder="example@upi"
              required
            />
          </div>
        </div>
      )}
      
      
      
      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handlePreviousStep}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNextStep}
        >
          Review Payment
        </button>
      </div>
    </>
  );

  const renderStepThree = () => (
    <>
      <div className="card mb-4">
        <div className="card-header">
          Payment Summary
        </div>
        <div className="card-body">
          <div className="row mb-2">
            <div className="col-6">
              <strong>Amount:</strong>
            </div>
            <div className="col-6 text-end">
              ₹{amount}
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-6">
              <strong>Payment Method:</strong>
            </div>
            <div className="col-6 text-end">
              {paymentMethod === 'creditCard' && 'Credit/Debit Card'}
              {paymentMethod === 'upi' && 'UPI'}
              {paymentMethod === 'bankTransfer' && 'Bank Transfer'}
            </div>
          </div>
          {paymentMethod === 'creditCard' && (
            <div className="row mb-2">
              <div className="col-6">
                <strong>Card Number:</strong>
              </div>
              <div className="col-6 text-end">
                **** **** **** {paymentDetails.cardNumber.slice(-4)}
              </div>
            </div>
          )}
          {paymentMethod === 'upi' && (
            <div className="row mb-2">
              <div className="col-6">
                <strong>UPI ID:</strong>
              </div>
              <div className="col-6 text-end">
                {paymentDetails.upiId}
              </div>
            </div>
          )}
          
          <div className="row mb-2">
            <div className="col-6">
              <strong>Total Points:</strong>
            </div>
            <div className="col-6 text-end">
              <strong>{amount} points</strong>
            </div>
          </div>
        </div>
      </div>
      
      <div className="form-check mb-4">
        <input className="form-check-input" type="checkbox" id="termsCheck" required />
        <label className="form-check-label" htmlFor="termsCheck">
          I agree to the terms and conditions for this transaction
        </label>
      </div>
      
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handlePreviousStep}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            'Confirm Payment'
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="recharge-wallet-container">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Recharge Wallet</h5>
          <div className="progress mt-2" style={{ height: '2px' }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${(step / 3) * 100}%` }}
              aria-valuenow={step}
              aria-valuemin="0"
              aria-valuemax="3"
            ></div>
          </div>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RechargeWallet; 