import React, { useState } from 'react';
import { X, Users, Sparkles } from 'lucide-react';
import { Person } from '../types/family';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkAdd: (names: string[]) => void;
  parentPerson: Person;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  onBulkAdd,
  parentPerson,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = inputText
      .split(/[\n,،]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (lines.length === 0) return;

    onBulkAdd(lines);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5" />

        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-cairo">
                إضافة دفعة أبناء وبنات
              </h3>
              <p className="text-xs text-stone-500">
                إلى عائلة: <span className="font-semibold text-stone-700">{parentPerson.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              اكتب أو الصق أسماء الأبناء (كل اسم في سطر جديد أو مفصولاً بفاصلة)
            </label>
            <textarea
              rows={5}
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="مثال:
سلطان
فهد
فيصل
نورة
هند"
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 font-cairo placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
            <span>سيتم إنشاء كل فرد تلقائياً وربطه كفرع لهذه الأسرة بنفس لون العائلة.</span>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
            >
              إضافة جميع الأسماء
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
