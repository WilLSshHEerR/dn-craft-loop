import { Routes, Route } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import DiamondCrown from './pages/DiamondCrown';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/projects/diamond-crown" element={<DiamondCrown />} />
    </Routes>
  );
}

export default App;
