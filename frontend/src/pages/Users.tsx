import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
  font-size: 0.875rem;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  padding: 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }

  svg {
    width: 14px;
    height: 14px;
  }
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

interface User {
  user_id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: {
    role_name: string;
    role_level: number;
  };
  is_active: boolean;
  created_at: string;
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
}

const Users: React.FC = () => {
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
  } = useForm<CreateUserForm>();

  const roles = [
    { value: 'analyst', label: 'Analyst' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateUserForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await api.post('/users', data);
      
      reset();
      setShowCreateForm(false);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'info';
      case 'admin':
        return 'success';
      case 'user':
        return 'warning';
      default:
        return undefined;
    }
  };

  return (
    <div>
      <PageHeader>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#2c3e50' }}>
            Users Management
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>
            Create and manage system users and account holders
          </p>
        </div>
        <PageActions>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus />
            Create User
          </Button>
        </PageActions>
      </PageHeader>

      {showCreateForm && (
        <Card style={{ marginBottom: '30px' }}>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
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
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  className={errors.username ? 'error' : ''}
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Must be at least 3 characters' }
                  })}
                />
                {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className={errors.email ? 'error' : ''}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  })}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className={errors.password ? 'error' : ''}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' }
                  })}
                />
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="Enter first name"
                  {...register('first_name', { required: 'First name is required' })}
                />
                {errors.first_name && <ErrorMessage>{errors.first_name.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Enter last name"
                  {...register('last_name', { required: 'Last name is required' })}
                />
                {errors.last_name && <ErrorMessage>{errors.last_name.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  {...register('phone')}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Select>
                {errors.role && <ErrorMessage>{errors.role.message}</ErrorMessage>}
              </FormGroup>
            </Form>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create User'}
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

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          {isLoading ? (
            <LoadingMessage>Loading users...</LoadingMessage>
          ) : users.length === 0 ? (
            <EmptyMessage>No users found. Create your first user to get started.</EmptyMessage>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <Td>{user.first_name} {user.last_name}</Td>
                    <Td>{user.username}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge $variant={getRoleBadgeVariant(user.role.role_name)}>
                        {user.role.role_name}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge $variant={user.is_active ? 'success' : 'warning'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>{formatDate(user.created_at)}</Td>
                    <Td>
                      <ActionButtons>
                        <IconButton title="View Details">
                          <Eye />
                        </IconButton>
                        <IconButton title="Edit User">
                          <Edit />
                        </IconButton>
                        <IconButton title="Delete User">
                          <Trash2 />
                        </IconButton>
                      </ActionButtons>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Users;