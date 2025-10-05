import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Plus, Shield, DollarSign, Clock, MapPin } from 'lucide-react';
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

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ProfilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ProfileCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 25px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ProfileIcon = styled.div`
  padding: 12px;
  border-radius: 8px;
  background-color: #e3f2fd;
  color: #1976d2;
`;

const ProfileName = styled.h4`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
`;

const LimitItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
`;

const LimitLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
`;

const LimitValue = styled.div`
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #2c3e50;
`;

const Checkbox = styled.input`
  margin: 0;
`;

interface SpendingProfile {
  profile_id: number;
  profile_name: string;
  description?: string;
  daily_limit?: number;
  monthly_limit?: number;
  per_transaction_limit?: number;
  allowed_mcc_codes?: string[];
  blocked_mcc_codes?: string[];
  allowed_countries?: string[];
  is_active: boolean;
  created_at: string;
}

interface CreateSpendingProfileForm {
  profile_name: string;
  description?: string;
  daily_limit?: number;
  monthly_limit?: number;
  per_transaction_limit?: number;
  allowed_countries?: string;
  block_international?: boolean;
  block_online?: boolean;
  block_atm?: boolean;
}

const SpendingProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<SpendingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSpendingProfileForm>();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/spending-profiles');
      setProfiles(response.data.data.profiles || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch spending profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateSpendingProfileForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert form data to API format
      const payload = {
        profile_name: data.profile_name,
        description: data.description || '',
        daily_limit: data.daily_limit ? parseFloat(data.daily_limit.toString()) : null,
        monthly_limit: data.monthly_limit ? parseFloat(data.monthly_limit.toString()) : null,
        per_transaction_limit: data.per_transaction_limit ? parseFloat(data.per_transaction_limit.toString()) : null,
        allowed_countries: data.allowed_countries ? data.allowed_countries.split(',').map(c => c.trim()) : ['US'],
        // Convert boolean checkboxes to MCC codes
        blocked_mcc_codes: [
          ...(data.block_international ? ['9999'] : []), // International transactions
          ...(data.block_online ? ['5816', '4816'] : []), // Online/digital payments
          ...(data.block_atm ? ['6010', '6011'] : []), // ATM transactions
        ],
      };
      
      await api.post('/spending-profiles', payload);
      
      reset();
      setShowCreateForm(false);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create spending profile');
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
            Spending Profiles
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>
            Create and manage spending limits and authorization rules
          </p>
        </div>
        <PageActions>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus />
            Create Profile
          </Button>
        </PageActions>
      </PageHeader>

      {showCreateForm && (
        <Card style={{ marginBottom: '30px' }}>
          <CardHeader>
            <CardTitle>Create New Spending Profile</CardTitle>
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
                <Label htmlFor="profile_name">Profile Name *</Label>
                <Input
                  id="profile_name"
                  type="text"
                  placeholder="Enter profile name (e.g., Conservative Spending)"
                  className={errors.profile_name ? 'error' : ''}
                  {...register('profile_name', { 
                    required: 'Profile name is required',
                    minLength: { value: 3, message: 'Must be at least 3 characters' }
                  })}
                />
                {errors.profile_name && <ErrorMessage>{errors.profile_name.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and rules of this spending profile"
                  {...register('description')}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="daily_limit">Daily Spending Limit</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('daily_limit')}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="monthly_limit">Monthly Spending Limit</Label>
                <Input
                  id="monthly_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('monthly_limit')}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="per_transaction_limit">Per Transaction Limit</Label>
                <Input
                  id="per_transaction_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('per_transaction_limit')}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="allowed_countries">Allowed Countries (comma-separated)</Label>
                <Input
                  id="allowed_countries"
                  type="text"
                  placeholder="US, CA, MX"
                  defaultValue="US"
                  {...register('allowed_countries')}
                />
              </FormGroup>

              <FormGroup>
                <Label>Transaction Restrictions</Label>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <Checkbox type="checkbox" {...register('block_international')} />
                    Block international transactions
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox type="checkbox" {...register('block_online')} />
                    Block online purchases
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <Checkbox type="checkbox" {...register('block_atm')} />
                    Block ATM withdrawals
                  </CheckboxLabel>
                </CheckboxGroup>
              </FormGroup>
            </Form>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
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
          All Spending Profiles ({profiles.length})
        </h2>

        {isLoading ? (
          <LoadingMessage>Loading spending profiles...</LoadingMessage>
        ) : profiles.length === 0 ? (
          <EmptyMessage>No spending profiles found. Create your first profile to get started.</EmptyMessage>
        ) : (
          <ProfilesGrid>
            {profiles.map((profile) => (
              <ProfileCard key={profile.profile_id}>
                <ProfileHeader>
                  <ProfileIcon>
                    <Shield size={24} />
                  </ProfileIcon>
                  <div>
                    <ProfileName>{profile.profile_name}</ProfileName>
                    <Badge $variant={profile.is_active ? 'success' : 'warning'}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </ProfileHeader>

                {profile.description && (
                  <div style={{ marginBottom: '20px', color: '#6c757d', fontSize: '0.875rem' }}>
                    {profile.description}
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  {profile.daily_limit && (
                    <LimitItem>
                      <LimitLabel>
                        <Clock size={16} />
                        Daily Limit
                      </LimitLabel>
                      <LimitValue>{formatCurrency(profile.daily_limit)}</LimitValue>
                    </LimitItem>
                  )}

                  {profile.monthly_limit && (
                    <LimitItem>
                      <LimitLabel>
                        <DollarSign size={16} />
                        Monthly Limit
                      </LimitLabel>
                      <LimitValue>{formatCurrency(profile.monthly_limit)}</LimitValue>
                    </LimitItem>
                  )}

                  {profile.per_transaction_limit && (
                    <LimitItem>
                      <LimitLabel>
                        <DollarSign size={16} />
                        Per Transaction
                      </LimitLabel>
                      <LimitValue>{formatCurrency(profile.per_transaction_limit)}</LimitValue>
                    </LimitItem>
                  )}

                  {profile.allowed_countries && profile.allowed_countries.length > 0 && (
                    <LimitItem>
                      <LimitLabel>
                        <MapPin size={16} />
                        Allowed Countries
                      </LimitLabel>
                      <LimitValue>{profile.allowed_countries.join(', ')}</LimitValue>
                    </LimitItem>
                  )}
                </div>

                <div style={{ fontSize: '0.875rem', color: '#6c757d', textAlign: 'center' }}>
                  Created: {formatDate(profile.created_at)}
                </div>
              </ProfileCard>
            ))}
          </ProfilesGrid>
        )}
      </div>
    </div>
  );
};

export default SpendingProfiles;