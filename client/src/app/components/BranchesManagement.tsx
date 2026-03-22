import { Building2, Plus, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

export function BranchesManagement() {
  // אנחנו משתמשים ב-Hook הקיים כדי לקבל את רשימת הסניפים
  const { branches, loading } = useDashboardData('all', '', 1, { start: '', end: '' });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ניהול סניפים</h2>
          <p className="text-sm text-slate-500">צפייה וניהול של כל סניפי המערכת</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all">
          <Plus className="w-4 h-4" /> סניף חדש
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">שם הסניף</th>
                <th className="px-6 py-4">מזהה</th>
                <th className="px-6 py-4">סטטוס</th>
                <th className="px-6 py-4 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{branch.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono">#{branch.id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      פעיל
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors" title="עריכה">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="מחיקה">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}