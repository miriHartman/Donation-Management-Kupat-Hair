import { useState, useEffect } from 'react';
import { 
  Search, Calendar, Filter, Download, Plus, Edit2, X, Check, Loader2,
  Building2, Banknote, Users, CreditCard, ArrowRight, CalendarClock,
  ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, FileText, Repeat
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData'; 
import { useDonationForm } from '../hooks/useDonationForm';

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
  // קבלת התאריך של היום בפורמט YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  
  // הגדרת תאריך סיום דיפולטיבי להיום
  const [dateRange, setDateRange] = useState({ start: '', end: today });
  const [debouncedDateRange, setDebouncedDateRange] = useState({ start: '', end: today });
  
  const [page, setPage] = useState(1); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // --- פונקציות עזר לתצוגה ---
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

  const { 
    transactions, 
    stats, 
    branches, 
    todaySummary,
    branchSummary, 
    loading: dataLoading,
    fetchData 
  } = useDashboardData(selectedBranchFilter, debouncedSearch, page, debouncedDateRange);

  const { formData, setFormData, handleSave, loading: formLoading } = useDonationForm(
    editingTransaction,
    () => {
      setIsModalOpen(false);
      fetchData(); 
    },
    editingTransaction?.branchId || 0
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setDebouncedDateRange(dateRange);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, dateRange]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      amount: 0,
      targetId: 1,
      methodId: 1,
      isRecurring: false,
      installments: 1,
      currency: 'ILS',
      branchId: 0,
      date: new Date().toISOString().split('T')[0]
    } as any);
    setIsModalOpen(true);
  };

  const openEditModal = (trx: any) => {
    const foundBranch = branches.find((b: any) => b.name === trx.branch);
    const bId = trx.branchId || foundBranch?.id || 0;
    setEditingTransaction({ ...trx, branchId: bId });
    setFormData({ ...trx, branchId: bId });
    setIsModalOpen(true);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId || Number(formData.branchId) === 0) {
      alert("נא לבחור סניף");
      return;
    }
    await handleSave();
  };

  if (dataLoading && page === 1) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-medium">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-right" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">ניהול מערכת</h1>
              <p className="text-xs text-slate-500 font-medium">ממשק מנהל כללי</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={openAddModal} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md">
              <Plus className="w-4 h-4" />
              תרומה חדשה
            </button>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-600 transition-colors text-sm font-medium">יציאה</button>
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
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full w-fit`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{stat.change}</span>
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
            <div className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
              סה"כ יומי: ₪{todaySummary?.total?.toLocaleString() || 0}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {todaySummary?.branches?.map((branch: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-500 font-bold mb-1 truncate w-full text-center">{branch.name}</span>
                <span className="text-lg font-black text-indigo-600 leading-none">₪{(branch.amount || 0).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">{branch.count || 0} תרומות</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
              <Filter className="w-5 h-5 text-indigo-600" />
              <span>סינון נתונים</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="חיפוש לפי מזהה..."
                  className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold mr-1">סניף</label>
                <select 
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                >
                  <option value="all">כל הסניפים</option>
                  {branches?.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold mr-1">מתאריך</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold mr-1">עד תאריך</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>פילוח רווחיות סניפים בהתאם לסינון</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {branchSummary && branchSummary.length > 0 ? (
                [...branchSummary].sort((a, b) => (b.amount || 0) - (a.amount || 0)).map((branch: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700">{branch.name}</span>
                      <span className="text-indigo-600">
                        {branch.percentage || 0}% 
                        <span className="text-slate-400 font-normal mr-1">
                          (₪{(branch.amount || 0).toLocaleString()})
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${branch.percentage || 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-slate-400 text-xs">אין נתונים להצגת פילוח בתקופה זו</p>
              )}
            </div>
          </div>
        </div>

        {/* טבלת עסקאות */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-4 py-4 text-indigo-900">סה"כ לתרומה</th>
                  <th className="px-4 py-4">סכום (לחודש)</th>
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
                {transactions.map((trx) => {
                  const isRec = !!trx.isRecurring;
                  const amount = Number(trx.amount) || 0;
                  const months = isRec ? (Number(trx.installments) || 1) : 1;
                  const total = isRec ? (amount * months) : amount;

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-4 font-black text-indigo-900">₪{total.toLocaleString()}</td>
                      <td className="px-4 py-4 font-bold text-slate-700">₪{amount.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        {isRec ? (
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">{months} חודשים</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                          isRec ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isRec && <Repeat className="w-3 h-3" />}
                          {isRec ? 'מחזורי' : 'חד פעמי'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{getTargetLabel(trx.targetId)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          {getPaymentIcon(trx.methodId)}
                          <span>{getPaymentLabel(trx.methodId)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{trx.branch}</td>
                      <td className="px-4 py-4 text-slate-500 text-xs">{trx.date}</td>
                      <td className="px-4 py-4 text-left">
                        <button onClick={() => openEditModal(trx)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal - הוספה/עריכה */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingTransaction ? 'עריכת תרומה' : 'הוספת תרומה'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={onFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">שייך לסניף</label>
                <select
                  required
                  value={formData.branchId || ''}
                  onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value="0">בחירת סניף...</option>
                  {branches?.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">תאריך</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">יעד</label>
                  <select
                    value={formData.targetId}
                    onChange={(e) => setFormData({ ...formData, targetId: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                  >
                    <option value={1}>קופת העיר</option>
                    <option value={2}>קרנות</option>
                    <option value={3}>אחר</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={!formData.isRecurring} 
                    onChange={() => setFormData({...formData, isRecurring: false, installments: 1})}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-bold text-slate-700">חד פעמי</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={formData.isRecurring} 
                    onChange={() => setFormData({...formData, isRecurring: true})}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-bold text-slate-700">מחזורי (הו"ק)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">סכום (₪)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 text-lg font-black text-indigo-900 border border-slate-200 rounded-lg outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">חודשים</label>
                  <input
                    type="number"
                    disabled={!formData.isRecurring}
                    value={formData.installments || 1}
                    onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">אמצעי תשלום</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 1, label: 'מזומן' }, { id: 2, label: 'אשראי' }, { id: 3, label: "צ'ק" }, { id: 4, label: 'הו"ק' }].map((method) => (
                    <label key={method.id} className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                        formData.methodId === method.id ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      <input type="radio" className="hidden" name="method" checked={formData.methodId === method.id} onChange={() => setFormData({...formData, methodId: method.id})} />
                      {method.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">ביטול</button>
                <button 
                  type="submit" 
                  disabled={formLoading} 
                  className="flex-[2] px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> אישור ושמירה</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}