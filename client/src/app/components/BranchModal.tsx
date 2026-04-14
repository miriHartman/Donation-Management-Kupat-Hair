import { useState, useEffect } from 'react';
import { X, Building2, Save, MapPin, Phone, ToggleLeft } from 'lucide-react';
import { BranchModalProps, Branch } from '../types';

export function BranchModal({ isOpen, onClose, onSave, editingBranch }: BranchModalProps) {
  // ניהול סטייט לכל השדות מה-DB
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    is_active: 1 // ברירת מחדל פעיל (tinyint 1)
  });

  // עדכון הסטייט כאשר פותחים לעריכה או מאפסים להוספה
  useEffect(() => {
    if (editingBranch) {
      setFormData({
        name: editingBranch.name || '',
        address: editingBranch.address || '',
        phone: editingBranch.phone || '',
        is_active: Number(editingBranch.is_active) || 1
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        is_active: 1
      });
    }
  }, [editingBranch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData); // שולח את כל האובייקט המעודכן
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* כותרת המודאל */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {editingBranch ? 'עריכת סניף' : 'הוספת סניף חדש'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* שדה שם הסניף */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
              <Building2 className="w-4 h-4 text-slate-400" /> שם הסניף
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right"
              placeholder="לדוגמה: בני ברק - מרכז"
            />
          </div>

          {/* שדה כתובת */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
              <MapPin className="w-4 h-4 text-slate-400" /> כתובת
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right"
              placeholder="רחוב, עיר"
            />
          </div>

          {/* שדה טלפון */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
              <Phone className="w-4 h-4 text-slate-400" /> טלפון
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right"
              placeholder="050-0000000"
            />
          </div>

          {/* שדה סטטוס (פעיל/לא פעיל) */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <ToggleLeft className={`w-5 h-5 ${formData.is_active ? 'text-green-600' : 'text-slate-400'}`} />
              <span className="text-sm font-bold text-slate-700">סטטוס סניף פעיל</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* כפתורי פעולה */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Save className="w-4 h-4" /> שמירה
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}