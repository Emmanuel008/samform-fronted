import { Navigate, Route, Routes } from 'react-router-dom';
import GuestRegistrationForm from './components/GuestRegistrationForm/GuestRegistrationForm';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestRegistrationForm />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
