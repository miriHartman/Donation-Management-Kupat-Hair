import React, { useState } from 'react';
import { User, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth(onLogin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 text-right" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header עם הלוגו מה-Public */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-inner p-2">
            <img 
              src="/logo.png" 
              alt="לוגו קופת העיר" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">ניהול תרומות</h1>
          <p className="text-blue-100 text-sm">מערכת לניהול ובקרת תרומות</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">שם משתמש</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="הזן שם משתמש..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
              placeholder="הכנס סיסמה..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>התחבר למערכת</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}