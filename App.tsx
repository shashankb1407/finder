
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  UserRole, 
  MissingPerson, 
  StatusHistory, 
  Tip, 
  CaseStatus, 
  TipStatus 
} from './types';
import PoliceDashboard from './pages/PoliceDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import LoginPage from './pages/LoginPage';
import { Search, Shield, Users, LogOut, Bell, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);

  // Load Initial Data
  useEffect(() => {
    const storedCases = localStorage.getItem('ft_cases');
    const storedHistory = localStorage.getItem('ft_history');
    const storedTips = localStorage.getItem('ft_tips');
    const storedUser = localStorage.getItem('ft_user');

    if (storedCases) setCases(JSON.parse(storedCases));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedTips) setTips(JSON.parse(storedTips));
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('ft_cases', JSON.stringify(cases));
  }, [cases]);
  useEffect(() => {
    localStorage.setItem('ft_history', JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    localStorage.setItem('ft_tips', JSON.stringify(tips));
  }, [tips]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ft_user');
  };

  const addCase = (newCase: MissingPerson) => {
    setCases(prev => [newCase, ...prev]);
    addHistoryRecord(newCase.id, newCase.fullName, 'None', CaseStatus.MISSING, user?.name || 'System');
  };

  const updateCaseStatus = (id: string, newStatus: CaseStatus) => {
    const target = cases.find(c => c.id === id);
    if (!target) return;

    const prevStatus = target.status;
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    addHistoryRecord(id, target.fullName, prevStatus, newStatus, user?.name || 'System');
  };

  const addHistoryRecord = (caseId: string, personName: string, previousStatus: string, updatedStatus: CaseStatus, updatedBy: string) => {
    const newHistory: StatusHistory = {
      id: Math.random().toString(36).substr(2, 9),
      caseId,
      personName,
      previousStatus,
      updatedStatus,
      updatedAt: new Date().toLocaleString(),
      updatedBy
    };
    setHistory(prev => [newHistory, ...prev]);
  };

  const addTip = (newTip: Tip) => {
    setTips(prev => [newTip, ...prev]);
  };

  const updateTipStatus = (tipId: string, status: TipStatus) => {
    setTips(prev => prev.map(t => t.id === tipId ? { ...t, status } : t));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    setHistory(prev => prev.filter(h => h.caseId !== id));
    setTips(prev => prev.filter(t => t.caseId !== id));
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Navigation Header */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Shield size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                FindTrace <span className="text-blue-600">AI</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/citizen" className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1">
                <Users size={18} /> Public Board
              </Link>
              {user?.role === UserRole.POLICE && (
                <Link to="/police" className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1">
                  <Shield size={18} /> Police Panel
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  Auth Login
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/citizen" replace />} />
            <Route path="/login" element={<LoginPage onLogin={(u) => { setUser(u); localStorage.setItem('ft_user', JSON.stringify(u)); }} />} />
            <Route 
              path="/citizen" 
              element={
                <CitizenDashboard 
                  cases={cases} 
                  onAddTip={addTip} 
                />
              } 
            />
            <Route 
              path="/police" 
              element={
                user?.role === UserRole.POLICE ? (
                  <PoliceDashboard 
                    cases={cases} 
                    history={history}
                    tips={tips}
                    onAddCase={addCase}
                    onUpdateCase={updateCaseStatus}
                    onDeleteCase={deleteCase}
                    onUpdateTip={updateTipStatus}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </main>

        <footer className="bg-white border-t py-8 text-center text-slate-500 text-sm">
          <p>© 2024 FindTrace AI – Advanced Missing Person Tracking System. Official Government Portal.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
