import React, { useEffect, useState } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const API_BASE = import.meta.env.VITE_API_BASE;
const SUPERADMIN_EMAIL = 'sharmarohan2507@gmail.com';

// Fetch wrapper with Clerk session token
const fetchWithAuth = async (url, options = {}) => {
  const token = await window.Clerk?.session?.getToken();
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
};

// Main Dashboard component
const Dashboard = () => {
  const { user } = useUser();
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [view, setView] = useState('orgs'); // 'orgs', 'users', 'org-users'
  
  // Form states
  const [orgForm, setOrgForm] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [editingOrg, setEditingOrg] = useState(null);
  
  // Role determination
  const isSuperadmin = user?.emailAddresses?.[0]?.emailAddress === SUPERADMIN_EMAIL;
  const isAdmin = user?.publicMetadata?.role === 'admin' || isSuperadmin;
  const role = isSuperadmin ? 'superadmin' : (user?.publicMetadata?.role || 'member');

  // Load functions
  const loadOrgs = async () => {
    try {
      const data = await fetchWithAuth('/org');
      setOrgs(data.data || data || []);
    } catch (err) {
      console.error('Load orgs error:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await fetchWithAuth('/users');
      setAllUsers(data.data || data || []);
    } catch (err) {
      console.error('Load users error:', err);
    }
  };

  const loadOrgUsers = async (orgId) => {
    try {
      const data = await fetchWithAuth(`/org/${orgId}/users`);
      setOrgUsers(data.data || data || []);
    } catch (err) {
      console.error('Load org users error:', err);
    }
  };

  const getOneOrg = async (orgId) => {
    try {
      const data = await fetchWithAuth(`/org/${orgId}`);
      console.log('Org details:', data);
      setSelectedOrg(data.data || data);
    } catch (err) {
      console.error('Get org error:', err);
    }
  };

  useEffect(() => {
    if (isSuperadmin || isAdmin) {
      loadOrgs();
    }
    if (isSuperadmin) {
      loadAllUsers();
    }
  }, [isSuperadmin, isAdmin]);

  // CRUD Operations
  const createOrg = async () => {
    if (!orgForm.name) return;
    try {
      await fetchWithAuth('/org', {
        method: 'POST',
        body: JSON.stringify(orgForm),
      });
      setOrgForm({ name: '', description: '' });
      loadOrgs();
      alert('Organization created!');
    } catch (err) {
      console.error('Create org error:', err);
      alert('Error creating organization');
    }
  };

  const editOrg = async () => {
    if (!editingOrg || !orgForm.name) return;
    try {
      await fetchWithAuth(`/org/${editingOrg.id || editingOrg._id}`, {
        method: 'PATCH',
        body: JSON.stringify(orgForm),
      });
      setEditingOrg(null);
      setOrgForm({ name: '', description: '' });
      loadOrgs();
      alert('Organization updated!');
    } catch (err) {
      console.error('Edit org error:', err);
      alert('Error updating organization');
    }
  };

  const deleteOrg = async (orgId) => {
    if (!confirm('Delete this organization?')) return;
    try {
      await fetchWithAuth(`/org/${orgId}`, { method: 'DELETE' });
      loadOrgs();
      alert('Organization deleted!');
    } catch (err) {
      console.error('Delete org error:', err);
      alert('Error deleting organization');
    }
  };

  const inviteAdmin = async (orgId) => {
    if (!inviteEmail) return;
    try {
      await fetchWithAuth(`/org/${orgId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: 'admin' }),
      });
      setInviteEmail('');
      alert('Admin invitation sent!');
    } catch (err) {
      console.error('Invite admin error:', err);
      alert('Error inviting admin');
    }
  };

  const inviteMember = async (orgId) => {
    if (!inviteEmail) return;
    try {
      await fetchWithAuth(`/org/${orgId}/invite-member`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: 'member' }),
      });
      setInviteEmail('');
      alert('Member invitation sent!');
    } catch (err) {
      console.error('Invite member error:', err);
      alert('Error inviting member');
    }
  };

  const updateUser = async (orgId, userId, updates) => {
    try {
      await fetchWithAuth(`/org/${orgId}/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      loadOrgUsers(orgId);
      alert('User updated!');
    } catch (err) {
      console.error('Update user error:', err);
      alert('Error updating user');
    }
  };

  const deleteUser = async (orgId, userId) => {
    if (!confirm('Remove this user?')) return;
    try {
      await fetchWithAuth(`/org/${orgId}/users/${userId}`, { method: 'DELETE' });
      loadOrgUsers(orgId);
      alert('User removed!');
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Error removing user');
    }
  };

  const startEdit = (org) => {
    setEditingOrg(org);
    setOrgForm({ name: org.name, description: org.description || '' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">RBAC Dashboard</h1>
          <p className="text-gray-600">Welcome {user?.fullName} - Role: {role}</p>
        </div>
        <button 
          onClick={() => window.Clerk?.signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 mb-6">
        {(isSuperadmin || isAdmin) && (
          <button 
            onClick={() => setView('orgs')}
            className={`px-4 py-2 rounded ${view === 'orgs' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Organizations
          </button>
        )}
        {isSuperadmin && (
          <button 
            onClick={() => setView('users')}
            className={`px-4 py-2 rounded ${view === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All Users
          </button>
        )}
        {view === 'org-users' && (
          <button 
            onClick={() => setView('orgs')}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Back to Organizations
          </button>
        )}
      </div>

      {/* Organizations View */}
      {view === 'orgs' && (isSuperadmin || isAdmin) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Organizations</h2>
          
          {/* Create/Edit Form - Superadmin Only */}
          {isSuperadmin && (
            <div className="bg-gray-100 p-4 rounded mb-6">
              <h3 className="font-medium mb-2">
                {editingOrg ? 'Edit Organization' : 'Create Organization'}
              </h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({...orgForm, name: e.target.value})}
                  className="border p-2 rounded flex-1"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={orgForm.description}
                  onChange={(e) => setOrgForm({...orgForm, description: e.target.value})}
                  className="border p-2 rounded flex-1"
                />
                <button 
                  onClick={editingOrg ? editOrg : createOrg}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {editingOrg ? 'Update' : 'Create'}
                </button>
                {editingOrg && (
                  <button 
                    onClick={() => {
                      setEditingOrg(null);
                      setOrgForm({ name: '', description: '' });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Organizations List */}
          <div className="space-y-4">
            {orgs.map((org) => (
              <div key={org.id || org._id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <p className="text-gray-600">{org.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => getOneOrg(org.id || org._id)}
                      className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedOrg(org);
                        loadOrgUsers(org.id || org._id);
                        setView('org-users');
                      }}
                      className="bg-purple-500 text-white px-3 py-1 text-sm rounded hover:bg-purple-600"
                    >
                      View Users
                    </button>
                    {isSuperadmin && (
                      <>
                        <button 
                          onClick={() => startEdit(org)}
                          className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteOrg(org.id || org._id)}
                          className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Invite Section */}
                {(isSuperadmin || isAdmin) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <input
                        type="email"
                        placeholder="Email to invite"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="border p-2 rounded flex-1 text-sm"
                      />
                      {isSuperadmin && (
                        <button 
                          onClick={() => inviteAdmin(org.id || org._id)}
                          className="bg-orange-500 text-white px-3 py-2 text-sm rounded hover:bg-orange-600"
                        >
                          Invite Admin
                        </button>
                      )}
                      {(isSuperadmin || isAdmin) && (
                        <button 
                          onClick={() => inviteMember(org.id || org._id)}
                          className="bg-green-500 text-white px-3 py-2 text-sm rounded hover:bg-green-600"
                        >
                          Invite Member
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users View - Superadmin Only */}
      {view === 'users' && isSuperadmin && (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <div className="space-y-2">
            {allUsers.map((user) => (
              <div key={user.id || user._id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{user.email || user.emailAddresses?.[0]?.emailAddress}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded">
                    {user.role || 'member'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    Org: {user.orgClerkId || 'None'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Users View */}
      {view === 'org-users' && selectedOrg && (isSuperadmin || isAdmin) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Users in {selectedOrg.name}
          </h2>
          <div className="space-y-2">
            {orgUsers.map((user) => (
              <div key={user.id || user._id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{user.email || user.emailAddresses?.[0]?.emailAddress}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded">
                    {user.role || 'member'}
                  </span>
                </div>
                <div className="space-x-2">
                  <select 
                    value={user.role || 'member'}
                    onChange={(e) => updateUser(selectedOrg.id || selectedOrg._id, user.id || user._id, { role: e.target.value })}
                    className="border p-1 rounded text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button 
                    onClick={() => deleteUser(selectedOrg.id || selectedOrg._id, user.id || user._id)}
                    className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member View */}
      {role === 'member' && (
        <div className="bg-blue-50 p-6 rounded">
          <h2 className="text-xl font-semibold mb-2">Welcome Member!</h2>
          <p className="text-gray-700">You have member access to your organization.</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div className="min-h-screen bg-gray-50">
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6">RBAC System</h2>
              <SignIn routing="hash" />
            </div>
          </div>
        </SignedOut>
      </div>
    </ClerkProvider>
  );
};

export default App;