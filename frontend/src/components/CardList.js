import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cards');
      setLoading(false);
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="card">
      <h3>Card List</h3>
      
      {cards.length === 0 ? (
        <p style={{ color: '#666', marginTop: '10px' }}>No cards found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Last 4</th>
              <th>Type</th>
              <th>User</th>
              <th>Spending Profile</th>
              <th>Spend Limit</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                <td>****{card.lastFour}</td>
                <td><span className="badge active">{card.cardType}</span></td>
                <td>{card.user.name}</td>
                <td>{card.spendingProfile ? card.spendingProfile.name : '-'}</td>
                <td>
                  {card.spendLimit 
                    ? `$${parseFloat(card.spendLimit).toFixed(2)} / ${card.spendLimitDuration}`
                    : '-'
                  }
                </td>
                <td><span className={`badge ${card.status}`}>{card.status}</span></td>
                <td>{new Date(card.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CardList;
