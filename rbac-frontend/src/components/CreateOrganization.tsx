import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

const CreateOrganization: React.FC = () => {
  const { getToken } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/org`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgName,
          clerkId: `org_${Date.now()}` // Generate unique ID
        }),
      });

      if (response.ok) {
        alert(`Organization "${orgName}" created successfully!`);
        setOrgName('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create organization');
      }
    } catch (err) {
      alert('Network error while creating organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-organization">
      <h2>Create New Organization</h2>
      <form onSubmit={handleSubmit} className="create-org-form">
        <div className="form-group">
          <label htmlFor="orgName">Organization Name</label>
          <input
            type="text"
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Enter organization name"
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
};

export default CreateOrganization;