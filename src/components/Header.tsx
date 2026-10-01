import React, { useState } from 'react';
import { Share2, RotateCcw, Plus, Download, Sparkles } from 'lucide-react';
import { FamilyTree } from '../types/family';

interface HeaderProps {
  tree: FamilyTree;
  totalMembers: number;
  onNewTree: () => void;
  onResetSample: () => void;
  onExportPosterTab: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tree,
  totalMembers,
  onNewTree,
  onResetSample,
  onExportPosterTab,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-800 flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0">
            <img
              src="/src/assets/images/family_crest_gold_1790692307035.jpg"
              alt="شعار العائلة"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-amiri text-amber-400 font-bold text-base select-none">س</span>
          </div>
          <div className="truncate">
            <h1 className="text-sm font-bold tracking-tight truncate text-stone-100 font-cairo">
              {tree.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <span className="text-amber-400 font-medium">سلسال العائلة</span>
              <span aria-hidden="true">·</span>
              <span>{totalMembers} فرداً مسجلاً</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportPosterTab}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm min-h-[38px]"
            title="معاينة الشجرة وتصديرها"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">حفظ وتصدير</span>
            <span className="sm:hidden">تصدير</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="خيارات الشجرة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-48 bg-stone-900 rounded-xl shadow-xl border border-stone-800 py-1.5 z-50 text-right">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNewTree();
                    }}
                    className="w-full px-4 py-2.5 text-xs text-stone-200 hover:bg-stone-800 hover:text-amber-400 flex items-center justify-between"
                  >
                    <span>إنشاء شجرة جديدة</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onResetSample();
                    }}
                    className="w-full px-4 py-2.5 text-xs text-stone-200 hover:bg-stone-800 hover:text-amber-400 flex items-center justify-between"
                  >
                    <span>استرجاع النموذج التجريبي</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
