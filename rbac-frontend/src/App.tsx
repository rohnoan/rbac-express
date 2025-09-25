 import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Router>
        <div className="App">
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
            <Routes>
              <Route path="/*" element={<Dashboard />} />
            </Routes>
          </SignedIn>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;