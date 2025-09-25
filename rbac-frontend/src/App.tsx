import React, { useEffect, useState } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser, RedirectToSignIn } from '@clerk/clerk-react';

type Role = 'superadmin' | 'admin' | 'member';

interface Org { _id: string; name: string; clerkId: string; }
interface OrgUser { clerkId: string; email: string; role: Role; }

const REACT_APP_API_URL = process.env.REACT_APP_API_URL!;
const REACT_APP_SUPERADMIN_EMAIL = process.env.REACT_APP_SUPERADMIN_EMAIL!;
const REACT_APP_CLERK_FRONTEND_API = process.env.REACT_APP_CLERK_FRONTEND_API!;

const AppContent: React.FC = () => {
  const { user } = useUser();
  const [role, setRole] = useState<Role | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);

  useEffect(() => {
    if (user) {
      if (user.emailAddresses[0].emailAddress === REACT_APP_SUPERADMIN_EMAIL) {
        setRole('superadmin');
      } else {
        setRole(user.publicMetadata.role as Role);
      }
    }
  }, [user]);

  const fetchOrgs = async () => {
    if (!user) return;
    const token = await user.getToken();
    const res = await fetch(`${REACT_APP_API_URL}/org`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setOrgs(data.organizations || []);
  };

  const fetchOrgUsers = async (orgId: string) => {
    if (!user) return;
    const token = await user.getToken();
    const res = await fetch(`${REACT_APP_API_URL}/org/${orgId}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data.users || []);
  };

  if (!user) return <RedirectToSignIn />;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome {user.firstName}</h1>
      <p>Role: {role}</p>

      {role === 'superadmin' && (
        <>
          <button onClick={fetchOrgs}>Load All Organizations</button>
          <ul>
            {orgs.map(org => (
              <li key={org._id}>
                {org.name} 
                <button onClick={() => fetchOrgUsers(org.clerkId)}>View Users</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {role === 'admin' && (
        <>
          <h2>Your Organization Users</h2>
          <button onClick={() => fetchOrgUsers(user.publicMetadata.orgClerkId)}>Load Users</button>
        </>
      )}

      {users.length > 0 && (
        <ul>
          {users.map(u => <li key={u.clerkId}>{u.email} - {u.role}</li>)}
        </ul>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ClerkProvider frontendApi={REACT_APP_CLERK_FRONTEND_API}>
    <SignedIn>
      <AppContent />
    </SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </ClerkProvider>
);

export default App;
