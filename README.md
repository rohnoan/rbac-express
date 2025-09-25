implenting rbac with clerk and express


endpoints
GET    /                           - Health check
GET    /org                        - Get all orgs (superadmin)
GET    /org/:id                    - Get one org (member+)
POST   /org                        - Create org (superadmin)
PATCH  /org/:id                    - Edit org (superadmin)
DELETE /org/:id                    - Delete org (superadmin)
POST   /org/:id/invite             - Invite admin (superadmin)
GET    /org/:id/users              - Get users in org (admin+)
GET    /org/:id/users/:userId      - Get one user in org (admin+)
PATCH  /org/:id/users/:userId      - Update user in org (admin+)
DELETE /org/:id/users/:userId      - Delete user from org (admin+)
GET    /users                      - Get all users (superadmin)