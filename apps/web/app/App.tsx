'use client';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { CreateCampaign } from './components/admin/CreateCampaign';
import { ManageCampaigns } from './components/admin/ManageCampaigns';
import { Transportistas } from './components/admin/Transportistas';
import { AvailableCampaigns } from './components/donante/AvailableCampaigns';
import { MyDonations } from './components/donante/MyDonations';
import { DonationTraceability } from './components/donante/DonationTraceability';
import { AssignedCampaigns } from './components/transportista/AssignedCampaigns';

import { TransportTraceability } from './components/transportista/TransportTraceability';

type UserRole = 'donante' | 'transportista' | 'administrador' | null;

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as UserRole;
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setUserRole(null);
  };

  const getDefaultRoute = (role: UserRole): string => {
    switch (role) {
      case 'donante':
        return '/campanas';
      case 'transportista':
        return '/campanas-asignadas';
      case 'administrador':
        return '/gestion-campanas';
      default:
        return '/login';
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUserRole} />} />
        <Route path="/registro" element={<Register onLogin={setUserRole} />} />

        {userRole ? (
          <Route
            path="/*"
            element={
              <div className="flex h-screen overflow-hidden">
                <Sidebar userRole={userRole} onLogout={handleLogout} />
                <main className="flex-1 overflow-y-auto bg-background pt-4">
                  <Routes>
                    <Route path="/" element={<Navigate to={getDefaultRoute(userRole)} replace />} />
                    <Route path="/perfil" element={<Profile />} />

                    {userRole === 'donante' && (
                      <>
                        <Route path="/campanas" element={<AvailableCampaigns />} />
                        <Route path="/mis-donaciones" element={<MyDonations />} />
                        <Route path="/trazabilidad" element={<DonationTraceability />} />
                      </>
                    )}

                    {userRole === 'transportista' && (
                      <>
                        <Route path="/campanas-asignadas" element={<AssignedCampaigns />} />
                        <Route path="/trazabilidad-transporte" element={<TransportTraceability />} />
                      </>
                    )}

                    {userRole === 'administrador' && (
                      <>
                        <Route path="/crear-campana" element={<CreateCampaign />} />
                        <Route path="/gestion-campanas" element={<ManageCampaigns />} />
                        <Route path="/transportistas" element={<Transportistas />} />
                      </>
                    )}

                    <Route path="*" element={<Navigate to={getDefaultRoute(userRole)} replace />} />
                  </Routes>
                </main>
              </div>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;