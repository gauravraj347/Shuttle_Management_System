import React, { useState, useEffect } from 'react';
import { walletApi } from '../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await walletApi.getTransactions();
        
        if (response.data.success) {
          setTransactions(response.data.data);
        }
      } catch (error) {
        setError('Failed to load transaction history: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });
  
  // Format transaction date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'RECHARGE':
        return <i className="bi bi-wallet-fill text-success"></i>;
      case 'TICKET_PURCHASE':
        return <i className="bi bi-ticket-perforated text-danger"></i>;
      case 'REFUND':
        return <i className="bi bi-arrow-return-left text-info"></i>;
      case 'MONTHLY_ALLOCATION':
        return <i className="bi bi-calendar-check text-primary"></i>;
      case 'ADMIN_ADJUSTMENT':
        return <i className="bi bi-gear-fill text-secondary"></i>;
      default:
        return <i className="bi bi-arrow-repeat text-secondary"></i>;
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div className="transaction-history">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Transaction History</h5>
        <div className="dropdown">
          <button 
            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
            type="button" 
            id="filterDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            {filter === 'all' ? 'All Transactions' : `Filter: ${filter}`}
          </button>
          <ul className="dropdown-menu" aria-labelledby="filterDropdown">
            <li>
              <button 
                className="dropdown-item" 
                onClick={() => setFilter('all')}
              >
                All Transactions
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item" 
                onClick={() => setFilter('RECHARGE')}
              >
                Recharges
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item" 
                onClick={() => setFilter('TICKET_PURCHASE')}
              >
                Ticket Purchases
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item" 
                onClick={() => setFilter('MONTHLY_ALLOCATION')}
              >
                Monthly Allocations
              </button>
            </li>
          </ul>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted mb-0">No transactions found</p>
        </div>
      ) : (
        <div className="list-group">
          {filteredTransactions.map(transaction => (
            <div key={transaction._id} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="me-3 fs-4">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <h6 className="mb-0">{transaction.description}</h6>
                    <small className="text-muted">{formatDate(transaction.createdAt)}</small>
                  </div>
                </div>
                <span className={`badge ${transaction.amount >= 0 ? 'bg-success' : 'bg-danger'} fs-6`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount} points
                </span>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                  {transaction.reference && <>Ref: {transaction.reference}</>}
                </small>
                <small>Balance: {transaction.balance} points</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 