import { useState, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, WalletCards, 
  Trash2, Edit2, Info, Hash, Building2, Calendar
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useBranches } from '../hooks/useBranches';
import { DonationData } from '../types';
import { NewDonationModal } from '../components/NewDonationModal';

export function FundsManagement() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<DonationData | null>(null);

  // אנחנו שולחים 'all' לסניף אבל נסנן בתוך הטבלה רק את ה-targetId של קרנות
  const { transactions, loading, fetchData, deleteDonation } = useDashboardData(
    'all', 
    debouncedSearch, 
    page, 
    { start: '', end: '' }
  );
  
  const { allBranches } = useBranches();

  // סינון הנתונים שיוצגו רק קרנות (Target ID 2)
  const fundTransactions = transactions.filter(trx => Number(trx.targetId) === 2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setPage(1);
    }, 700);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const openEditModal = (trx: any) => {
    const foundBranch = allBranches.find((b: any) => b.name === trx.branch);
    setEditingTransaction({ ...trx, branchId: foundBranch?.id || 0 });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ניהול תרומות לקרנות</h2>
          <p className="text-slate-500 text-sm">מעקב אחר מספרי קרנות והערות מיוחדות</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש לפי עובדת/הערה..."
            className="w-full pr-9 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4"><div className="flex items-center gap-2"><Hash className="w-4 h-4"/> מס' קרן</div></th>
                <th className="px-6 py-4"><div className="flex items-center gap-2"><Info className="w-4 h-4"/> הערה/פירוט</div></th>
                <th className="px-6 py-4">סכום</th>
                <th className="px-6 py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4"/> סניף</div></th>
                <th className="px-6 py-4"><div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> תאריך</div></th>
                <th className="px-6 py-4">עובדת</th>
                <th className="px-6 py-4 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">טוען נתונים...</td></tr>
              ) : fundTransactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">לא נמצאו תרומות לקרנות</td></tr>
              ) : (
                fundTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-black border border-amber-100">
                        {trx.fundNumber || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-slate-600 truncate font-medium" title={trx.targetOtherNote || trx.notes}>
                        {trx.targetOtherNote || trx.notes || <span className="text-slate-300 italic">אין הערה</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 text-lg">
                      ₪{(Number(trx.amount) || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{trx.branch}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {trx.date ? new Date(trx.date).toLocaleDateString('he-IL') : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{trx.workerName}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(trx)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteDonation(trx.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">עמוד {page}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setPage(prev => prev + 1)} disabled={fundTransactions.length < 10} className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <NewDonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={() => { fetchData(); setIsModalOpen(false); }}
        editingDonation={editingTransaction}
        branches={allBranches}
        branchId={Number(editingTransaction?.branchId) || 0}
        showAdminFields={true}
      />
    </div>
  );
}