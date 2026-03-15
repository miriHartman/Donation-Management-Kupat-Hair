import React from 'react';
import { Building2, MapPin, Users, ChevronLeft, Loader2 } from 'lucide-react';
import { useBranches } from '../hooks/useBranches';

interface BranchSelectorProps {
  onSelectBranch: (branchId: number, branchName: string) => void;
  onAdminAccess: () => void;
}

const BRAND_COLORS = [
  'bg-blue-600',
  'bg-cyan-600',
  'bg-teal-600',
  'bg-emerald-600',
  'bg-sky-600',
  'bg-indigo-600'
];

export function BranchSelector({ onSelectBranch, onAdminAccess }: BranchSelectorProps) {
  const { branches, isLoading } = useBranches();

  // שליפת המשתמש מהאחסון המקומי ובדיקת הרשאות מנהל
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'admin';

  const getBranchColor = (id: number) => {
    return BRAND_COLORS[id % BRAND_COLORS.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium font-sans">טוען נתוני סניפים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-8 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">בחירת סניף לפעילות</h1>
          <p className="text-slate-500 text-lg">מערכת ניהול תרומות - קופת העיר</p>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {branches.map((branch) => {
            const branchColor = getBranchColor(branch.id);
            
            return (
              <button
                key={branch.id}
                onClick={() => onSelectBranch(branch.id, branch.name)}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl border border-slate-100 hover:border-transparent transition-all duration-300 hover:-translate-y-1 text-right overflow-hidden flex flex-col h-full"
              >
                {/* Hover Background Layer */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${branchColor} -z-0`} />
                
                <div className="relative z-10 flex flex-col h-full w-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 ${branchColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-colors`}>
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    
                  </div>
                  
                  {/* שם הסניף */}
                  <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-white transition-colors leading-tight">
                    {branch.name}
                  </h3>

                  {/* כתובת הסניף */}
                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-50 mb-6 transition-colors min-h-[1.5rem]">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{branch.address || 'כתובת לא הוזנה'}</span>
                  </div>

                  {/* שורת סטטיסטיקה תחתונה */}
                  <div className="mt-auto pt-6 border-t border-slate-100 group-hover:border-white/20 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-white transition-colors">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{branch.employees || 0} עובדים</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-blue-600 group-hover:text-white font-bold text-sm transition-colors">
                      <span>כניסה לסניף</span>
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* דקורציה ברקע */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-slate-50 group-hover:bg-white/10 rounded-full transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Admin Section - מוצג רק למנהלים */}
        {isAdmin && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-px w-24 bg-slate-200" />
            <button
              onClick={onAdminAccess}
              className="group flex items-center gap-3 px-10 py-4 bg-white hover:bg-slate-900 border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-white rounded-2xl font-bold shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Building2 className="w-5 h-5 text-blue-600 group-hover:text-blue-400" />
              <span>כניסה כמנהל מערכת</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}