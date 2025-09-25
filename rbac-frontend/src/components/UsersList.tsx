import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const UsersList: React.FC = () => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          // Mock data
          setUsers([
            { _id: '1', clerkId: 'user_123', role: 'admin', orgClerkId: 'org_123', email: 'admin@acme.com' },
            { _id: '2', clerkId: 'user_456', role: 'member', orgClerkId: 'org_123', email: 'user@acme.com' },
            { _id: '3', clerkId: 'user_789', role: 'admin', orgClerkId: 'org_456', email: 'admin@techstart.com' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="users-list">
      <h2>All Users</h2>
      <div className="users-table">
        {users.map((user) => (
          <div key={user._id} className="user-row">
            <div className="user-info">
              <strong>{user.email}</strong>
              <span>ID: {user.clerkId}</span>
            </div>
            <div className="user-role">
              <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
            </div>
            <div className="user-org">
              <span>Org: {user.orgClerkId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;