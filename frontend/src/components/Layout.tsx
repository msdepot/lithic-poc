import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Building, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
`;

const Sidebar = styled.nav`
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #34495e;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ecf0f1;
`;

const Subtitle = styled.p`
  margin: 5px 0 0 0;
  font-size: 0.875rem;
  color: #bdc3c7;
`;

const Nav = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
  flex: 1;
`;

const NavItem = styled.li<{ $isActive: boolean }>`
  margin: 0;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  color: ${props => props.$isActive ? '#ffffff' : '#bdc3c7'};
  text-decoration: none;
  background-color: ${props => props.$isActive ? '#34495e' : 'transparent'};
  border-right: ${props => props.$isActive ? '3px solid #3498db' : '3px solid transparent'};
  transition: all 0.2s ease;

  &:hover {
    background-color: #34495e;
    color: #ffffff;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const UserInfo = styled.div`
  padding: 20px;
  border-top: 1px solid #34495e;
  background-color: #233140;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 5px;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: #bdc3c7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 0;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 10px;
  transition: color 0.2s ease;

  &:hover {
    color: #c0392b;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: #ffffff;
`;

const ContentHeader = styled.div`
  padding: 30px 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
`;

const ContentBody = styled.div`
  padding: 30px 40px;
  min-height: calc(100vh - 140px);
`;

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/accounts', label: 'Accounts', icon: Building },
    { path: '/cards', label: 'Cards', icon: CreditCard },
    { path: '/spending-profiles', label: 'Spending Profiles', icon: Shield },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const navItem = navigationItems.find(item => item.path === currentPath);
    return navItem?.label || 'Admin CRM';
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarHeader>
          <Logo>Lithic Admin</Logo>
          <Subtitle>Payment Card Management</Subtitle>
        </SidebarHeader>

        <Nav>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavItem key={item.path} $isActive={location.pathname === item.path}>
                <NavLink to={item.path} $isActive={location.pathname === item.path}>
                  <IconComponent />
                  {item.label}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>

        <UserInfo>
          <UserName>{user?.first_name || user?.username}</UserName>
          <UserRole>{user?.role?.role_name}</UserRole>
          <LogoutButton onClick={logout}>
            <LogOut />
            Logout
          </LogoutButton>
        </UserInfo>
      </Sidebar>

      <MainContent>
        <ContentHeader>
          <PageTitle>{getPageTitle()}</PageTitle>
        </ContentHeader>
        <ContentBody>
          <Outlet />
        </ContentBody>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;