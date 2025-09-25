import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Organization {
  _id: string;
  name: string;
  clerkId: string;
  createdAt: string;
}

const OrganizationsList: React.FC = () => {
  const { getToken } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrganizations = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Mock data for demo
        setOrganizations([
          { _id: '1', name: 'Acme Corp', clerkId: 'org_123', createdAt: '2024-01-15' },
          { _id: '2', name: 'TechStart Inc', clerkId: 'org_456', createdAt: '2024-02-20' },
          { _id: '3', name: 'Global Solutions', clerkId: 'org_789', createdAt: '2024-03-10' },
        ]);
      } else {
        setError(data.error || 'Failed to fetch organizations');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Delete organization "${orgName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/org/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(`Organization "${orgName}" deleted successfully`);
        fetchOrganizations(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete organization');
      }
    } catch (err) {
      alert('Network error while deleting organization');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  if (loading) return <div className="loading">Loading organizations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="organizations-list">
      <h2>All Organizations</h2>
      <div className="organizations-grid">
        {organizations.map((org) => (
          <div key={org._id} className="org-card">
            <h3>{org.name}</h3>
            <p>ID: {org.clerkId}</p>
            <p>Created: {new Date(org.createdAt).toLocaleDateString()}</p>
            <div className="org-actions">
              <button className="btn btn-primary">Edit</button>
              <button 
                className="btn btn-danger"
                onClick={() => deleteOrganization(org.clerkId, org.name)}
              >
                Delete
              </button>
              <button className="btn btn-secondary">Invite Admin</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsList;