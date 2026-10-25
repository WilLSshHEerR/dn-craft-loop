import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import DiamondCrown from './pages/DiamondCrown';

const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/projects/diamond-crown" element={<DiamondCrown />} />
      <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
    </Routes>
  );
}

export default App;
