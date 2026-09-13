import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import TransactionsLedger from './components/TransactionsLedger';
import SmartAllocator from './components/SmartAllocator';
import ClientManager from './components/ClientManager';
import GPayModal from './components/GPayModal';
import AddTransactionModal from './components/AddTransactionModal';
import AddAccountModal from './components/AddAccountModal';
import AuthPortal from './components/AuthPortal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import { fetchClients, fetchDashboard } from './api';

export default function App() {
  const [clients, setClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('wealthflow_client_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'transactions' | 'allocator' | 'clients'
  const [loading, setLoading] = useState(false);

  // Modals
  const [isGPayModalOpen, setIsGPayModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddAccModalOpen, setIsAddAccModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Load clients on startup
  useEffect(() => {
    loadAllClients();
  }, []);

  const loadAllClients = async () => {
    try {
      const res = await fetchClients();
      if (res.success && res.clients.length > 0) {
        setClients(res.clients);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  // Load dashboard when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      loadDashboard(currentUser.id);
    }
  }, [currentUser]);

  const loadDashboard = async (clientId) => {
    setLoading(true);
    try {
      const res = await fetchDashboard(clientId);
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (client) => {
    setCurrentUser(client);
    localStorage.setItem('wealthflow_client_session', JSON.stringify(client));
    loadAllClients();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wealthflow_client_session');
  };

  const handleProfileUpdated = (updatedClient) => {
    setCurrentUser(updatedClient);
    localStorage.setItem('wealthflow_client_session', JSON.stringify(updatedClient));
    loadAllClients();
    loadDashboard(updatedClient.id);
  };

  const handleSelectClient = (clientId) => {
    const target = clients.find(c => c.id === clientId);
    if (target) {
      handleAuthenticated(target);
    }
  };

  // If no client is authenticated, display the Login & Onboarding Portal
  if (!currentUser) {
    return (
      <AuthPortal
        clients={clients}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  const accounts = dashboardData?.accounts || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-800">
      
      {/* Top Navigation Bar (Bright & Crisp) */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGPayModal={() => setIsGPayModalOpen(true)}
        onOpenAddModal={() => setIsAddTxModalOpen(true)}
        netWorth={dashboardData?.summary?.netWorth}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !dashboardData ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-mono">Syncing tenant database `{currentUser.dbFileName}`...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                dashboardData={dashboardData}
                activeClient={currentUser}
                onOpenGPayModal={() => setIsGPayModalOpen(true)}
                onOpenAddModal={() => setIsAddTxModalOpen(true)}
                onOpenAddAccountModal={() => setIsAddAccModalOpen(true)}
                onNavigateToTransactions={() => setActiveTab('transactions')}
                onNavigateToAllocator={() => setActiveTab('allocator')}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsLedger
                clientId={currentUser.id}
                currency={currentUser.currency}
                accounts={accounts}
                onOpenAddModal={() => setIsAddTxModalOpen(true)}
                onOpenGPayModal={() => setIsGPayModalOpen(true)}
                onTransactionsUpdated={() => loadDashboard(currentUser.id)}
              />
            )}

            {activeTab === 'allocator' && (
              <SmartAllocator
                clientId={currentUser.id}
                currency={currentUser.currency}
                actualIncome={currentUser.monthly_income_target || dashboardData?.summary?.monthlyIncome || 95000}
                actualExpenses={currentUser.monthly_expense_baseline || dashboardData?.summary?.monthlyExpenses || 38000}
              />
            )}

            {activeTab === 'clients' && (
              <ClientManager
                clients={clients}
                activeClient={currentUser}
                onSelectClient={handleSelectClient}
                onClientCreated={handleAuthenticated}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGPayModal={() => setIsGPayModalOpen(true)}
      />

      {/* Modals */}
      <ProfileSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        client={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />

      <GPayModal
        isOpen={isGPayModalOpen}
        onClose={() => setIsGPayModalOpen(false)}
        clientId={currentUser.id}
        accounts={accounts}
        onTransactionAdded={() => loadDashboard(currentUser.id)}
      />

      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        clientId={currentUser.id}
        accounts={accounts}
        onTransactionAdded={() => loadDashboard(currentUser.id)}
      />

      <AddAccountModal
        isOpen={isAddAccModalOpen}
        onClose={() => setIsAddAccModalOpen(false)}
        clientId={currentUser.id}
        onAccountAdded={() => loadDashboard(currentUser.id)}
      />

    </div>
  );
}
