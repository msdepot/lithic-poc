import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Plus, CreditCard, Lock, Unlock, Eye, Settings } from 'lucide-react';
import api from '../services/api';

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageActions = styled.div`
  margin-left: auto;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover { background-color: #c82333; }
        `;
      case 'success':
        return `
          background-color: #28a745;
          color: white;
          &:hover { background-color: #218838; }
        `;
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          &:hover { background-color: #5a6268; }
        `;
      default:
        return `
          background-color: #007bff;
          color: white;
          &:hover { background-color: #0056b3; }
        `;
    }
  }}

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
`;

const CardHeader = styled.div`
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
`;

const CardBody = styled.div`
  padding: 25px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &.error {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PaymentCard = styled.div<{ $cardType: string }>`
  background: ${props => {
    switch (props.$cardType) {
      case 'credit':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'debit':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'prepaid':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default:
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    }
  }};
  color: white;
  border-radius: 12px;
  padding: 25px;
  min-height: 200px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const CardTypeLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 10px;
`;

const CardNumber = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 2px;
`;

const CardHolder = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 5px;
`;

const CardStatus = styled.div<{ $status: string }>`
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  color: ${props => {
    switch (props.$status) {
      case 'ACTIVE':
        return '#d4edda';
      case 'LOCKED':
        return '#f8d7da';
      case 'PENDING':
        return '#fff3cd';
      default:
        return '#e2e3e5';
    }
  }};
`;

const CardActions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  padding: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Badge = styled.span<{ $variant?: 'success' | 'warning' | 'info' | 'danger' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `background-color: #d4edda; color: #155724;`;
      case 'warning':
        return `background-color: #fff3cd; color: #856404;`;
      case 'info':
        return `background-color: #d1ecf1; color: #0c5460;`;
      case 'danger':
        return `background-color: #f8d7da; color: #721c24;`;
      default:
        return `background-color: #e2e3e5; color: #41464b;`;
    }
  }}
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 4px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
`;

interface Card {
  card_id: number;
  card_type: string;
  card_subtype?: string;
  status: string;
  last_four: string;
  user: {
    first_name: string;
    last_name: string;
    username: string;
  };
  account: {
    account_name: string;
    account_type: string;
  };
  created_at: string;
  lithic_card_token?: string;
}

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface Account {
  account_id: number;
  account_name: string;
  account_type: string;
}

interface CreateCardForm {
  user_id: number;
  account_id: number;
  card_type: string;
  card_subtype?: string;
  memo?: string;
}

const Cards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCardForm>();

  const cardTypes = [
    { value: 'credit', label: 'Credit Card' },
    { value: 'debit', label: 'Debit Card' },
    { value: 'prepaid', label: 'Prepaid Card' },
    { value: 'virtual', label: 'Virtual Card' },
  ];

  const cardSubtypes = [
    { value: 'business', label: 'Business Card' },
    { value: 'personal', label: 'Personal Card' },
    { value: 'corporate', label: 'Corporate Card' },
    { value: 'reloadable', label: 'Reloadable Card' },
  ];

  useEffect(() => {
    fetchCards();
    fetchUsers();
    fetchAccounts();
  }, []);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cards');
      setCards(response.data.data.cards || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch cards');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data.data.accounts || []);
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const onSubmit = async (data: CreateCardForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        ...data,
        user_id: parseInt(data.user_id.toString()),
        account_id: parseInt(data.account_id.toString()),
      };
      
      await api.post('/cards', payload);
      
      reset();
      setShowCreateForm(false);
      await fetchCards();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (lastFour: string) => {
    return `•••• •••• •••• ${lastFour}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'LOCKED':
        return 'danger';
      case 'PENDING':
        return 'warning';
      default:
        return 'info';
    }
  };

  const handleCardAction = async (cardId: number, action: string) => {
    try {
      await api.patch(`/cards/${cardId}/status`, {
        status: action,
        reason: `Card ${action.toLowerCase()} via admin panel`,
      });
      await fetchCards();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to ${action.toLowerCase()} card`);
    }
  };

  return (
    <div>
      <PageHeader>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#2c3e50' }}>
            Cards Management
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>
            Create and manage payment cards with Lithic integration
          </p>
        </div>
        <PageActions>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus />
            Create Card
          </Button>
        </PageActions>
      </PageHeader>

      {showCreateForm && (
        <Card style={{ marginBottom: '30px' }}>
          <CardHeader>
            <CardTitle>Create New Card</CardTitle>
          </CardHeader>
          <CardBody>
            {error && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f8d7da', 
                border: '1px solid #f5c6cb', 
                borderRadius: '6px', 
                color: '#721c24', 
                marginBottom: '20px' 
              }}>
                {error}
              </div>
            )}
            
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label htmlFor="user_id">Card Holder *</Label>
                <Select
                  id="user_id"
                  {...register('user_id', { required: 'Card holder is required' })}
                >
                  <option value="">Select card holder</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </Select>
                {errors.user_id && <ErrorMessage>{errors.user_id.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="account_id">Linked Account *</Label>
                <Select
                  id="account_id"
                  {...register('account_id', { required: 'Linked account is required' })}
                >
                  <option value="">Select account</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} ({account.account_type})
                    </option>
                  ))}
                </Select>
                {errors.account_id && <ErrorMessage>{errors.account_id.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="card_type">Card Type *</Label>
                <Select
                  id="card_type"
                  {...register('card_type', { required: 'Card type is required' })}
                >
                  <option value="">Select card type</option>
                  {cardTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {errors.card_type && <ErrorMessage>{errors.card_type.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="card_subtype">Card Subtype</Label>
                <Select
                  id="card_subtype"
                  {...register('card_subtype')}
                >
                  <option value="">Select subtype (optional)</option>
                  {cardSubtypes.map(subtype => (
                    <option key={subtype.value} value={subtype.value}>
                      {subtype.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="memo">Memo / Notes</Label>
                <Input
                  id="memo"
                  type="text"
                  placeholder="Optional notes about this card"
                  {...register('memo')}
                />
              </FormGroup>
            </Form>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Card...' : 'Create Card'}
              </Button>
              <Button 
                $variant="secondary" 
                type="button" 
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 600, color: '#2c3e50' }}>
          All Cards ({cards.length})
        </h2>

        {isLoading ? (
          <LoadingMessage>Loading cards...</LoadingMessage>
        ) : cards.length === 0 ? (
          <EmptyMessage>No cards found. Create your first card to get started.</EmptyMessage>
        ) : (
          <CardsGrid>
            {cards.map((card) => (
              <PaymentCard key={card.card_id} $cardType={card.card_type}>
                <CardActions>
                  <IconButton 
                    title="View Details"
                    onClick={() => console.log('View card details:', card.card_id)}
                  >
                    <Eye />
                  </IconButton>
                  <IconButton 
                    title="Card Settings"
                    onClick={() => console.log('Card settings:', card.card_id)}
                  >
                    <Settings />
                  </IconButton>
                  {card.status === 'ACTIVE' ? (
                    <IconButton 
                      title="Lock Card"
                      onClick={() => handleCardAction(card.card_id, 'LOCKED')}
                    >
                      <Lock />
                    </IconButton>
                  ) : (
                    <IconButton 
                      title="Unlock Card"
                      onClick={() => handleCardAction(card.card_id, 'ACTIVE')}
                    >
                      <Unlock />
                    </IconButton>
                  )}
                </CardActions>

                <CardTypeLabel>
                  {card.card_type} {card.card_subtype && `• ${card.card_subtype}`}
                </CardTypeLabel>
                
                <CardNumber>
                  {formatCardNumber(card.last_four)}
                </CardNumber>
                
                <div style={{ marginBottom: '10px' }}>
                  <CardHolder>{card.user.first_name} {card.user.last_name}</CardHolder>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {card.account.account_name}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CardStatus $status={card.status}>
                    <Badge $variant={getStatusBadgeVariant(card.status)}>
                      {card.status}
                    </Badge>
                  </CardStatus>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {formatDate(card.created_at)}
                  </div>
                </div>
              </PaymentCard>
            ))}
          </CardsGrid>
        )}
      </div>
    </div>
  );
};

export default Cards;