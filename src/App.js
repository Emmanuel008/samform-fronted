import { Navigate, Route, Routes } from 'react-router-dom';
import GuestRegistrationForm from './components/GuestRegistrationForm/GuestRegistrationForm';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import AdminOverview from './pages/AdminOverview/AdminOverview';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminRegistrations from './pages/AdminRegistrations/AdminRegistrations';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestRegistrationForm />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="registrations" element={<AdminRegistrations />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
