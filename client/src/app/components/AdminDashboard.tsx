import { useState, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, Filter, Plus, Edit2, 
  Building2, Banknote, Users, CreditCard, ArrowRight, CalendarClock,
  ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, FileText, Repeat
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData'; 
import { NewDonationModal } from '../components/NewDonationModal'; // <-- ייבוא הקומפוננטה

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
}

const iconMap: Record<string, any> = {
  'סה"כ תרומות': Banknote,
  'מספר תרומות': Users,
  'ממוצע לתרומה': CreditCard,
};

export function AdminDashboard({ onLogout, onBack }: AdminDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: today });
  const [debouncedDateRange, setDebouncedDateRange] = useState({ start: '', end: today });
  const [page, setPage] = useState(1); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const { 
    transactions, 
    stats, 
    branches, 
    todaySummary,
    branchSummary, 
    loading: dataLoading,
    fetchData 
  } = useDashboardData(selectedBranchFilter, debouncedSearch, page, debouncedDateRange);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setDebouncedDateRange(dateRange);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, dateRange]);

  // עזרים לתצוגה בטבלה
  const getPaymentIcon = (methodId: any) => {
    const id = Number(methodId);
    switch(id) {
      case 1: return <Wallet className="w-4 h-4 text-green-600" />;
      case 2: return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 3: return <FileText className="w-4 h-4 text-amber-600" />;
      case 4: return <Banknote className="w-4 h-4 text-purple-600" />;
      default: return <Banknote className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPaymentLabel = (methodId: any) => {
    const labels: Record<number, string> = { 1: 'מזומן', 2: 'אשראי', 3: "צ'ק", 4: 'הו"ק' };
    return labels[Number(methodId)] || 'לא ידוע';
  };

  const getTargetLabel = (targetId: any) => {
    const targets: Record<number, string> = { 1: 'קופת העיר', 2: 'קרנות', 3: 'אחר' };
    return targets[Number(targetId)] || 'כללי';
  };

  const openEditModal = (trx: any) => {
    const foundBranch = branches.find((b: any) => b.name === trx.branch);
    const bId = trx.branchId || foundBranch?.id || 0;
    setEditingTransaction({ ...trx, branchId: bId });
    setIsModalOpen(true);
  };

  if (dataLoading && page === 1) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-right" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-right" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">ניהול מערכת</h1>
              <p className="text-xs text-slate-500">ממשק מנהל כללי</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} 
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md"
            >
              <Plus className="w-4 h-4" /> תרומה חדשה
            </button>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-600 text-sm font-medium">יציאה</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const IconComponent = iconMap[stat.title] || Banknote;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                  <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full w-fit`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* הכנסות סניפים להיום */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
              <span>הכנסות סניפים להיום</span>
            </div>
            <div className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full">
              סה"כ יומי: ₪{todaySummary?.total?.toLocaleString() || 0}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {todaySummary?.branches?.map((branch: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center shadow-sm">
                <span className="text-xs text-slate-500 font-bold mb-1 truncate w-full text-center">{branch.name}</span>
                <span className="text-lg font-black text-indigo-600">₪{(branch.amount || 0).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-2">{branch.count || 0} תרומות</span>
              </div>
            ))}
          </div>
        </div>

        {/* סינון נתונים */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" placeholder="חיפוש לפי מזהה..."
                  className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <select 
                value={selectedBranchFilter} onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">כל הסניפים</option>
                {branches?.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
            </div>
          </div>

          {/* פילוח רווחיות */}
          <div className="bg-slate-50/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {branchSummary?.map((branch: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-700">{branch.name}</span>
                    <span className="text-indigo-600">{branch.percentage || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${branch.percentage || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* טבלת עסקאות */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-4 py-4">סה"כ</th>
                  <th className="px-4 py-4">סכום חודשי</th>
                  <th className="px-4 py-4">חודשים</th>
                  <th className="px-4 py-4 text-center">סוג</th>
                  <th className="px-4 py-4">יעד</th>
                  <th className="px-4 py-4">אמצעי תשלום</th>
                  <th className="px-4 py-4">סניף</th>
                  <th className="px-4 py-4">תאריך</th>
                  <th className="px-4 py-4 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="px-4 py-4 font-black text-indigo-900">₪{((Number(trx.amount) || 0) * (Number(trx.installments) || 1)).toLocaleString()}</td>
                    <td className="px-4 py-4 font-bold text-slate-700">₪{(Number(trx.amount) || 0).toLocaleString()}</td>
                    <td className="px-4 py-4">{trx.isRecurring ? <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">{trx.installments}</span> : '-'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${trx.isRecurring ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {trx.isRecurring && <Repeat className="w-3 h-3" />} {trx.isRecurring ? 'מחזורי' : 'חד-פעמי'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{getTargetLabel(trx.targetId)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        {getPaymentIcon(trx.methodId)} {getPaymentLabel(trx.methodId)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{trx.branch}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs">{trx.date}</td>
                    <td className="px-4 py-4 text-left">
                      <button onClick={() => openEditModal(trx)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">עמוד {page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
              <button onClick={() => setPage(prev => prev + 1)} disabled={transactions.length < 10} className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>

      {/* הקריאה הנקייה לקומפוננטת המודאל */}
      <NewDonationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchData} 
        editingDonation={editingTransaction}
        branches={branches}
        branchId={editingTransaction?.branchId || 0}
        showAdminFields={true} // חשוב: המנהל יכול לערוך תאריך וסניף
      />
    </div>
  );
}