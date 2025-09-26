import React, { useEffect, useState } from 'react';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  SignIn, 
  useUser, 
  useOrganizationList,
  useOrganization,
  CreateOrganization,
  OrganizationSwitcher
} from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SUPERADMIN_EMAIL = 'sharmarohan2507@gmail.com';

const Dashboard = () => {
  const { user } = useUser();
  const { organizationList, isLoaded: orgListLoaded } = useOrganizationList();
  const { organization } = useOrganization();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isSuperadmin = user?.emailAddresses?.[0]?.emailAddress === SUPERADMIN_EMAIL;
  const role = isSuperadmin ? 'superadmin' : 'member';

  console.log('Organizations:', organizationList);
  console.log('Current org:', organization);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">RBAC Dashboard</h1>
          <p>Welcome {user?.fullName} - Role: <strong>{role}</strong></p>
        </div>
        <div className="flex gap-4">
          <OrganizationSwitcher />
          <button 
            onClick={() => window.Clerk?.signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Superadmin View */}
      {isSuperadmin ? (
        <div>
          {/* Create Organization Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create Organization
            </button>
          </div>

          {/* Organizations List */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Organizations ({organizationList?.length || 0})
            </h2>
            
            {!orgListLoaded ? (
              <div className="text-center py-4">Loading organizations...</div>
            ) : organizationList && organizationList.length > 0 ? (
              <div className="space-y-4">
                {organizationList.map((org) => (
                  <div key={org.organization.id} className="border p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{org.organization.name}</h3>
                        <p className="text-gray-600 text-sm">
                          Members: {org.organization.membersCount}
                        </p>
                        <p className="text-gray-500 text-xs">
                          ID: {org.organization.id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => org.organization.destroy()}
                          className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Organization Members */}
                    <div className="mt-4 pt-3 border-t">
                      <h4 className="font-medium mb-2">Members:</h4>
                      <div className="space-y-1">
                        {org.organization.members?.map((member) => (
                          <div key={member.id} className="flex justify-between items-center text-sm">
                            <span>{member.publicUserData.firstName} {member.publicUserData.lastName}</span>
                            <span className="px-2 py-1 bg-blue-100 text-xs rounded">
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No organizations found. Create your first organization above.
              </div>
            )}
          </div>

          {/* Create Organization Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Create Organization</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <CreateOrganization 
                  afterCreateOrganizationUrl="/dashboard"
                  skipInvitationScreen={true}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Member View */
        <div className="space-y-6">
          {/* Current Organization */}
          {organization ? (
            <div className="bg-blue-50 p-6 rounded">
              <h2 className="text-xl font-bold mb-2">Your Organization</h2>
              <h3 className="text-lg font-semibold">{organization.name}</h3>
              <p className="text-gray-600">Members: {organization.membersCount}</p>
              <p className="text-sm text-gray-500 mt-2">
                You have member access to this organization.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-6 rounded">
              <h2 className="text-xl font-bold mb-2">No Organization</h2>
              <p className="text-gray-700">
                You are not currently a member of any organization. 
                Contact your administrator to get invited.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div className="min-h-screen bg-gray-50">
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <div className="min-h-screen flex items-center justify-center">
            <SignIn />
          </div>
        </SignedOut>
      </div>
    </ClerkProvider>
  );
};

export default App;