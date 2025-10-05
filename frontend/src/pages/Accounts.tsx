import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Plus, Building2, User, DollarSign } from 'lucide-react';
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
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

const AccountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const AccountCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AccountHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const AccountIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background-color: #f8f9fa;
  color: #6c757d;
`;

const AccountName = styled.h4`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
`;

const AccountDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
`;

const DetailLabel = styled.span`
  color: #6c757d;
`;

const DetailValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const Badge = styled.span<{ $variant?: 'success' | 'warning' | 'info' }>`
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

interface Account {
  account_id: number;
  account_name: string;
  account_type: string;
  balance: number;
  is_active: boolean;
  user: {
    first_name: string;
    last_name: string;
    username: string;
  };
  created_at: string;
}

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface CreateAccountForm {
  account_name: string;
  user_id: number;
  account_type: string;
  initial_balance?: number;
}

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountForm>();

  const accountTypes = [
    { value: 'business', label: 'Business Account' },
    { value: 'personal', label: 'Personal Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'checking', label: 'Checking Account' },
  ];

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/accounts');
      setAccounts(response.data.data.accounts || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch accounts');
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

  const onSubmit = async (data: CreateAccountForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        ...data,
        user_id: parseInt(data.user_id.toString()),
        initial_balance: data.initial_balance ? parseFloat(data.initial_balance.toString()) : 0,
      };
      
      await api.post('/accounts', payload);
      
      reset();
      setShowCreateForm(false);
      await fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <PageHeader>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#2c3e50' }}>
            Accounts Management
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>
            Create and manage business and personal accounts
          </p>
        </div>
        <PageActions>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus />
            Create Account
          </Button>
        </PageActions>
      </PageHeader>

      {showCreateForm && (
        <Card style={{ marginBottom: '30px' }}>
          <CardHeader>
            <CardTitle>Create New Account</CardTitle>
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
                <Label htmlFor="account_name">Account Name *</Label>
                <Input
                  id="account_name"
                  type="text"
                  placeholder="Enter account name (e.g., MSD Cafe Business Account)"
                  className={errors.account_name ? 'error' : ''}
                  {...register('account_name', { 
                    required: 'Account name is required',
                    minLength: { value: 3, message: 'Must be at least 3 characters' }
                  })}
                />
                {errors.account_name && <ErrorMessage>{errors.account_name.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="user_id">Account Owner *</Label>
                <Select
                  id="user_id"
                  {...register('user_id', { required: 'Account owner is required' })}
                >
                  <option value="">Select account owner</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </Select>
                {errors.user_id && <ErrorMessage>{errors.user_id.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="account_type">Account Type *</Label>
                <Select
                  id="account_type"
                  {...register('account_type', { required: 'Account type is required' })}
                >
                  <option value="">Select account type</option>
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {errors.account_type && <ErrorMessage>{errors.account_type.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="initial_balance">Initial Balance</Label>
                <Input
                  id="initial_balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('initial_balance')}
                />
              </FormGroup>
            </Form>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Account'}
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
          All Accounts ({accounts.length})
        </h2>

        {isLoading ? (
          <LoadingMessage>Loading accounts...</LoadingMessage>
        ) : accounts.length === 0 ? (
          <EmptyMessage>No accounts found. Create your first account to get started.</EmptyMessage>
        ) : (
          <AccountGrid>
            {accounts.map((account) => (
              <AccountCard key={account.account_id}>
                <AccountHeader>
                  <AccountIcon>
                    {account.account_type === 'business' ? <Building2 size={20} /> : <User size={20} />}
                  </AccountIcon>
                  <AccountName>{account.account_name}</AccountName>
                </AccountHeader>

                <AccountDetail>
                  <DetailLabel>Owner:</DetailLabel>
                  <DetailValue>{account.user.first_name} {account.user.last_name}</DetailValue>
                </AccountDetail>

                <AccountDetail>
                  <DetailLabel>Type:</DetailLabel>
                  <DetailValue style={{ textTransform: 'capitalize' }}>{account.account_type}</DetailValue>
                </AccountDetail>

                <AccountDetail>
                  <DetailLabel>Balance:</DetailLabel>
                  <DetailValue style={{ color: '#28a745', fontWeight: 600 }}>
                    {formatCurrency(account.balance)}
                  </DetailValue>
                </AccountDetail>

                <AccountDetail>
                  <DetailLabel>Status:</DetailLabel>
                  <Badge $variant={account.is_active ? 'success' : 'warning'}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </AccountDetail>

                <AccountDetail>
                  <DetailLabel>Created:</DetailLabel>
                  <DetailValue>{formatDate(account.created_at)}</DetailValue>
                </AccountDetail>
              </AccountCard>
            ))}
          </AccountGrid>
        )}
      </div>
    </div>
  );
};

export default Accounts;