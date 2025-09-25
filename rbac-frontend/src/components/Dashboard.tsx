import React, { useState, useEffect } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import OrganizationsList from './OrganizationsList';
import OrganizationDetail from './OrganizationDetail';
import UsersList from './UsersList';
import CreateOrganization from './CreateOrganization';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface User {
  _id: string;
  clerkId: string;
  role: 'superadmin' | 'admin' | 'member';
  orgClerkId: string;
}

const Dashboard: React.FC = () => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const location = useLocation();
  const [userRole, setUserRole] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user role for demo - in real app, get from your database
    const mockUser: User = {
      _id: 'mock_id',
      clerkId: clerkUser?.id || '',
      role: 'admin', // Change this to test different roles: 'superadmin', 'admin', 'member'
      orgClerkId: 'org_123'
    };
    setUserRole(mockUser);
    setLoading(false);
  }, [clerkUser]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const isSuperadmin = userRole?.role === 'superadmin';
  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'superadmin';
  const isMember = userRole?.role === 'member' || isAdmin;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>RBAC Dashboard</h1>
        <div className="user-info">
          <span className="role-badge role-{userRole?.role}">{userRole?.role.toUpperCase()}</span>
          <span>{clerkUser?.emailAddresses[0]?.emailAddress}</span>
          <UserButton />
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                🏠 Home
              </Link>
            </li>
            
            {isSuperadmin && (
              <>
                <li>
                  <Link 
                    to="/organizations" 
                    className={location.pathname === '/organizations' ? 'active' : ''}
                  >
                    🏢 All Organizations
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/users" 
                    className={location.pathname === '/users' ? 'active' : ''}
                  >
                    👥 All Users
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/create-org" 
                    className={location.pathname === '/create-org' ? 'active' : ''}
                  >
                    ➕ Create Organization
                  </Link>
                </li>
              </>
            )}
            
            {isMember && (
              <li>
                <Link 
                  to="/my-org" 
                  className={location.pathname === '/my-org' ? 'active' : ''}
                >
                  🏢 My Organization
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home userRole={userRole} />} />
            
            {isSuperadmin && (
              <>
                <Route path="/organizations" element={<OrganizationsList />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/create-org" element={<CreateOrganization />} />
              </>
            )}
            
            {isMember && (
              <Route 
                path="/my-org" 
                element={<OrganizationDetail orgId={userRole.orgClerkId} userRole={userRole.role} />} 
              />
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Home Component
const Home: React.FC<{ userRole: User | null }> = ({ userRole }) => {
  return (
    <div className="home">
      <h2>Welcome to RBAC System</h2>
      <div className="role-info">
        <h3>Your Role: {userRole?.role.toUpperCase()}</h3>
        <div className="permissions">
          <h4>Your Permissions:</h4>
          <ul>
            {userRole?.role === 'superadmin' && (
              <>
                <li>✅ View all organizations</li>
                <li>✅ Create/edit/delete organizations</li>
                <li>✅ View all users across system</li>
                <li>✅ Invite organization admins</li>
                <li>✅ Manage users in any organization</li>
              </>
            )}
            {userRole?.role === 'admin' && (
              <>
                <li>✅ View your organization details</li>
                <li>✅ View users in your organization</li>
                <li>✅ Invite users to your organization</li>
                <li>✅ Update user roles in your organization</li>
                <li>✅ Remove users from your organization</li>
              </>
            )}
            {userRole?.role === 'member' && (
              <>
                <li>✅ View your organization details</li>
                <li>❌ Limited access to user management</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;