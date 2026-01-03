
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.POLICE);
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: Math.random().toString(),
      name: role === UserRole.POLICE ? `Officer ${badge || '402'}` : 'Guest User',
      role,
      badgeNumber: badge
    };
    onLogin(mockUser);
    navigate(role === UserRole.POLICE ? '/police' : '/citizen');
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <ShieldCheck size={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Authorized Access</h1>
          <p className="text-blue-100 mt-2">FindTrace AI Centralized Management</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setRole(UserRole.POLICE)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${role === UserRole.POLICE ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              Police Dept
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.CITIZEN)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${role === UserRole.CITIZEN ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              Civilian
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Identification</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={role === UserRole.POLICE ? "Badge Number" : "Email Address"}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Secure Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Authenticate Session
          </button>
        </form>
      </div>
      
      <p className="text-center text-slate-400 mt-8 text-sm">
        Unauthorized access is strictly prohibited and monitored.
      </p>
    </div>
  );
};

export default LoginPage;
