import React, { useState } from 'react';
import { X, Sparkles, User, TreePine } from 'lucide-react';
import { createEmptyTree } from '../utils/initialData';
import { FamilyTree } from '../types/family';

interface NewTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTree: (newTree: FamilyTree) => void;
}

export const NewTreeModal: React.FC<NewTreeModalProps> = ({
  isOpen,
  onClose,
  onCreateTree,
}) => {
  const [ancestorName, setAncestorName] = useState('');
  const [treeTitle, setTreeTitle] = useState('');
  const [ancestorTitle, setAncestorTitle] = useState('الجد الأكبر المؤسس');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancestorName.trim()) return;

    const newTree = createEmptyTree(ancestorName.trim(), treeTitle.trim() || undefined);
    // customize root title
    const rootPerson = newTree.members[newTree.rootId];
    if (rootPerson && ancestorTitle.trim()) {
      rootPerson.title = ancestorTitle.trim();
    }

    onCreateTree(newTree);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom duration-200 text-right"
        role="dialog"
      >
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5" />

        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <TreePine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-cairo">
                إنشاء شجرة عائلة جديدة
              </h3>
              <p className="text-xs text-stone-500">
                ابدأ بتحديد الجد الأكبر ثم تفرع للأبناء والأحفاد
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              اسم الجد الأكبر الرئيسي <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={ancestorName}
                onChange={(e) => {
                  setAncestorName(e.target.value);
                  if (!treeTitle) {
                    const first = e.target.value.trim().split(' ')[0] || '';
                    if (first) setTreeTitle(`شجرة عائلة آل ${first}`);
                  }
                }}
                placeholder="مثال: الشيخ عبد الرحمن بن راشد"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-cairo"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              عنوان الشجرة
            </label>
            <input
              type="text"
              value={treeTitle}
              onChange={(e) => setTreeTitle(e.target.value)}
              placeholder="مثال: شجرة عائلة آل راشد المباركة"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              لقب أو صفة الجد
            </label>
            <input
              type="text"
              value={ancestorTitle}
              onChange={(e) => setAncestorTitle(e.target.value)}
              placeholder="مثال: الجد الأكبر المؤسس"
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              بعد الإنشاء، ستتمكن من إضافة كافة فروع الأبناء والعائلات وتخصيص ألوان مميزة لكل فرع وصولاً للجيل الحالي.
            </span>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
            >
              بدء بناء الشجرة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
