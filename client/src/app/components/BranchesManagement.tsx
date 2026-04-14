import { useState } from 'react'; 
import { Building2, Plus, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { BranchModal } from '../components/BranchModal';
import { toast } from 'sonner';
import { Branch } from '../types';

export function BranchesManagement() {
  const { allBranches, isLoading, refreshBranches, deleteBranch, saveBranch } = useBranches();
  
  // States לניהול המודאל והסניף הנבחר
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // פתיחת מודאל להוספת סניף חדש
  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  // פתיחת מודאל לעריכת סניף קיים
  const handleOpenEdit = (branch: any) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

 // פונקציית המחיקה (השבתה)
  const handleDelete = (id: number) => {
    toast.warning('מחיקת / השבתת סניף', {
      description: 'המערכת תבדוק אם קיימות תרומות או סיכום יומי לסניף זה לפני מחיקה סופית.',
      duration: 5000,
      action: {
        label: 'בצע',
        onClick: async () => {
          try {
            // הקריאה ל-deleteBranch מחזירה כעת את ה-result מהשרת (בזכות השינויים בהוק ובסרוויס)
            const result = await deleteBranch(id);
            
            // הצגת הודעה מותאמת לפי מה שקרה בפועל בבסיס הנתונים
            if (result && result.action === 'deleted') {
              toast.success('הסניף נמחק לצמיתות מהמערכת');
            } else if (result && result.action === 'deactivated') {
              toast.info('הסניף הועבר למצב "לא פעיל" כיוון שיש לו תרומות/סיכום סכום יומיים משויכות');
            } else {
              // ליתר ביטחון, אם לא הגיע action
              toast.success('הפעולה בוצעה בהצלחה');
            }

            // אין צורך לקרוא ל-refreshBranches כאן שוב כי הוספנו את זה בתוך ה-Hook
          } catch (error) {
            toast.error('שגיאה בביצוע הפעולה');
          }
        },
      },
      cancel: {
        label: 'ביטול',
        onClick: () => {}
      },
    });
  };

  // פונקציית השמירה (הוספה או עריכה)
  const handleSave = async (data: Partial<Branch>) => {
    try {
      await saveBranch(data, selectedBranch?.id);
      toast.success(selectedBranch ? 'הסניף עודכן בהצלחה' : 'סניף חדש נוסף בהצלחה');
      refreshBranches();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('שגיאה בשמירת נתוני הסניף');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ניהול סניפים</h2>
          <p className="text-sm text-slate-500">צפייה וניהול של כל סניפי המערכת</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all"
        >
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
  {allBranches.map((branch: Branch) => (
    <tr key={branch.id} className="hover:bg-slate-50 group transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${branch.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
            <Building2 className="w-5 h-5" />
          </div>
          <span className={`font-bold ${branch.is_active ? 'text-slate-700' : 'text-slate-400'}`}>
            {branch.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-500 font-mono">#{branch.id}</td>
      <td className="px-6 py-4">
        {/* כאן השינוי המרכזי - הצגת סטטוס דינמי */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          branch.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-slate-100 text-slate-500'
        }`}>
          {branch.is_active ? 'פעיל' : 'מושבת'}
        </span>
      </td>
      <td className="px-6 py-4 text-left">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleOpenEdit(branch)}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors" 
            title="עריכה"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(branch.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" 
            title="מחיקה"
          >
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

      {/* קריאה למודאל */}
      <BranchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingBranch={selectedBranch}
      />
    </div>
  );
}