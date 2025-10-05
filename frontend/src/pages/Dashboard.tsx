import React from 'react';
import styled from 'styled-components';
import { Users, CreditCard, Building, Activity } from 'lucide-react';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background-color: #f8f9fa;
  color: #6c757d;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const StatSubtext = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const QuickActions = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const ActionButton = styled.button`
  padding: 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: #3498db;
    background-color: #f8fdff;
  }
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const ActionDescription = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '8',
      subtext: '5 active, 3 pending',
      icon: Users,
    },
    {
      title: 'Active Cards',
      value: '12',
      subtext: '4 pending activation',
      icon: CreditCard,
    },
    {
      title: 'Accounts',
      value: '6',
      subtext: 'MSD Cafe + family',
      icon: Building,
    },
    {
      title: 'API Status',
      value: 'LIVE',
      subtext: 'Lithic sandbox',
      icon: Activity,
    },
  ];

  const quickActions = [
    {
      title: 'Create New User',
      description: 'Add a new user to the system with role assignment',
    },
    {
      title: 'Create Account',
      description: 'Set up a new business or personal account',
    },
    {
      title: 'Issue Card',
      description: 'Create and configure a new payment card',
    },
    {
      title: 'Set Spending Profile',
      description: 'Configure spending limits and rules',
    },
  ];

  return (
    <div>
      <DashboardGrid>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <StatCard key={index}>
              <StatHeader>
                <StatIcon>
                  <IconComponent size={20} />
                </StatIcon>
                <StatTitle>{stat.title}</StatTitle>
              </StatHeader>
              <StatValue>{stat.value}</StatValue>
              <StatSubtext>{stat.subtext}</StatSubtext>
            </StatCard>
          );
        })}
      </DashboardGrid>

      <QuickActions>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionGrid>
          {quickActions.map((action, index) => (
            <ActionButton key={index}>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
            </ActionButton>
          ))}
        </ActionGrid>
      </QuickActions>
    </div>
  );
};

export default Dashboard;