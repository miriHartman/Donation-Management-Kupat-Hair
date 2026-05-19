import { useState } from 'react';
import { X, User, Lock, Save } from 'lucide-react';
import { authService, userService } from '../services/authService';
import { toast } from 'sonner';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchId: number;
    branchName: string;
}

export function UserModal({ isOpen, onClose, branchId, branchName }: UserModalProps) {
    const [formData, setFormData] = useState({ username: branchName, password: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.createUser({ ...formData, branchId });
            toast.success('המשתמש נוצר בהצלחה');
            onClose();
        } catch (error) {
            toast.error('שגיאה ביצירת המשתמש');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">יצירת משתמש לסניף</h3>
                            <p className="text-xs text-slate-500">{branchName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                            <User className="w-4 h-4 text-slate-400" /> שם משתמש
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                            <Lock className="w-4 h-4 text-slate-400" /> סיסמה
                        </label>
                        <input
                            type="password"
                            required
                            minLength={4}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-right"
                            placeholder="לפחות 4 תווים"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> צור משתמש
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200"
                        >
                            דלג
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}