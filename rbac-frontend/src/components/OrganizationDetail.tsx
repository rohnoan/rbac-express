import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface User {
  _id: string;
  clerkId: string;
  role: string;
  email: string;
  name: string;
}

interface Props {
  orgId: string;
  userRole: 'superadmin' | 'admin' | 'member';
}

const OrganizationDetail: React.FC<Props> = ({ orgId, userRole }) => {
  const { getToken } = useAuth();
  const [organization, setOrganization] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  const fetchOrganization = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Mock data
        setOrganization({
          _id: orgId,
          name: 'My Organization',
          clerkId: orgId,
          createdAt: '2024-01-15'
        });
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org/${orgId}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Mock users data
        setUsers([
          { _id: '1', clerkId: 'user_123', role: 'admin', email: 'admin@company.com', name: 'John Admin' },
          { _id: '2', clerkId: 'user_456', role: 'member', email: 'user@company.com', name: 'Jane User' },
          { _id: '3', clerkId: 'user_789', role: 'member', email: 'member@company.com', name: 'Bob Member' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org/${orgId}/users/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail, role: 'member' }),
      });

      if (response.ok) {
        alert(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setShowInviteForm(false);
        fetchUsers(); // Refresh users list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      alert('Network error while sending invitation');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org/${orgId}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        alert(`User role updated to ${newRole}`);
        fetchUsers(); // Refresh users list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      alert('Network error while updating user role');
    }
  };

  const removeUser = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from the organization?`)) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org/${orgId}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(`${userName} removed from organization`);
        fetchUsers(); // Refresh users list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove user');
      }
    } catch (err) {
      alert('Network error while removing user');
    }
  };

  useEffect(() => {
    fetchOrganization();
    fetchUsers();
  }, [orgId, userRole]);

  if (loading) return <div className="loading">Loading organization details...</div>;

  return (
    <div className="organization-detail">
      <h2>{organization?.name || 'Organization Details'}</h2>
      
      <div className="org-info">
        <p><strong>Organization ID:</strong> {organization?.clerkId}</p>
        <p><strong>Created:</strong> {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Your Role:</strong> <span className={`role-badge role-${userRole}`}>{userRole.toUpperCase()}</span></p>
      </div>

      {isAdmin && (
        <>
          <div className="section">
            <div className="section-header">
              <h3>Team Members ({users.length})</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowInviteForm(!showInviteForm)}
              >
                Invite User
              </button>
            </div>

            {showInviteForm && (
              <form onSubmit={inviteUser} className="invite-form">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary">Send Invitation</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="users-table">
              {users.map((user) => (
                <div key={user._id} className="user-row">
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="user-role">
                    <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
                  </div>
                  <div className="user-actions">
                    <select 
                      value={user.role}
                      onChange={(e) => updateUserRole(user.clerkId, e.target.value)}
                      className="role-select"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => removeUser(user.clerkId, user.name)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!isAdmin && (
        <div className="member-view">
          <p>As a member, you can view organization details but cannot manage users.</p>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;