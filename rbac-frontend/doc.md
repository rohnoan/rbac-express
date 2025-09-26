src/
├── App.tsx                 # Main app with routing and role-based rendering
├── main.tsx               # Entry point with Clerk provider
├── index.css              # Tailwind imports
├── components/
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── OrganizationList.tsx   # List organizations (superadmin only)
│   ├── OrganizationCard.tsx   # Single org card component
│   ├── UserList.tsx           # List users in org (admin/superadmin)
│   ├── UserCard.tsx           # Single user card component
│   └── LoadingSpinner.tsx     # Loading component
├── hooks/
│   ├── useApi.ts             # Custom hook for API calls with auth
│   └── useRole.ts            # Custom hook to get user role
├── services/
│   └── api.ts               # API service functions
├── types/
│   └── index.ts             # TypeScript interfaces
└── utils/
    └── constants.ts         # API endpoints and role constants

# Root files needed:
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── .env.local               # Clerk keys