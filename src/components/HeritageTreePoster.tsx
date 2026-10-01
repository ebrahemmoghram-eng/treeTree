import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Share2, Printer, Check, Sparkles, Sliders, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyTree, PosterTheme } from '../types/family';
import {
  downloadTreeAsImage,
  downloadTreeAsPdf,
  shareTreeImage,
  renderFamilyTreeToCanvas,
} from '../utils/exportImage';

interface HeritageTreePosterProps {
  tree: FamilyTree;
}

export const HeritageTreePoster: React.FC<HeritageTreePosterProps> = ({ tree }) => {
  const [theme, setTheme] = useState<PosterTheme>('royal_parchment');
  const [showSpouses, setShowSpouses] = useState(true);
  const [showDates, setShowDates] = useState(true);
  const [showGenerations, setShowGenerations] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate live preview image whenever options change
  useEffect(() => {
    let isMounted = true;
    setIsRenderingPreview(true);

    const updatePreview = async () => {
      try {
        const canvas = await renderFamilyTreeToCanvas(tree, {
          theme,
          showSpouses,
          showDates,
          showGenerations,
          scale: 1.2, // fast preview scale
        });
        if (isMounted) {
          setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
          setIsRenderingPreview(false);
        }
      } catch (err) {
        console.error('Failed to generate preview', err);
        if (isMounted) setIsRenderingPreview(false);
      }
    };

    updatePreview();

    return () => {
      isMounted = false;
    };
  }, [tree, theme, showSpouses, showDates, showGenerations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      await downloadTreeAsImage(tree, {
        theme,
        showSpouses,
        showDates,
        showGenerations,
        scale: 2.0, // crisp high DPI
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('تم حفظ صورة شجرة العائلة عالية الدقة بنجاح!');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ الصورة');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await downloadTreeAsPdf(tree, {
        theme,
        showSpouses,
        showDates,
        showGenerations,
        scale: 2.0,
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('تم حفظ ملف PDF لشجرة العائلة بنجاح!');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const shared = await shareTreeImage(tree, {
        theme,
        showSpouses,
        showDates,
        showGenerations,
        scale: 1.8,
      });
      if (shared) {
        showToast('تمت مشاركة الشجرة بنجاح!');
      } else {
        // Fallback: download image
        handleDownloadImage();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const themeOptions: { id: PosterTheme; label: string; desc: string; previewClass: string }[] = [
    {
      id: 'royal_parchment',
      label: 'التراثي الملكي',
      desc: 'ورق بردي معتق وذهبيات كلاسيكية',
      previewClass: 'bg-[#f7f2e8] text-amber-900 border-amber-300',
    },
    {
      id: 'emerald_heritage',
      label: 'الزمردي الأندلسي',
      desc: 'أخضر ملكي فاخر وزخارف ذهبية',
      previewClass: 'bg-[#062e24] text-amber-300 border-emerald-700',
    },
    {
      id: 'midnight_luxury',
      label: 'العصري الليلي',
      desc: 'خلفية داكنة فخمة وألوان مضيئة',
      previewClass: 'bg-[#0f172a] text-slate-100 border-slate-700',
    },
    {
      id: 'pure_minimal',
      label: 'النقي الهادئ',
      desc: 'تصميم بسيط مريح وخلفية بيضاء',
      previewClass: 'bg-white text-stone-900 border-stone-200',
    },
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-400 px-4 py-2.5 rounded-xl shadow-xl border border-amber-500/30 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="text-center mb-5 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/40 shadow-md mb-2 bg-stone-900">
          <img
            src="/src/assets/images/family_crest_gold_1790692307035.jpg"
            alt="وسام العائلة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-amiri">
          لوحة شجرة العائلة الجدارية
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          تصميم متكامل يوضح الجد الأكبر وكافة الفروع المتفرعة حتى الجيل الحالي بألوان مخصصة لكل فرع
        </p>
      </div>

      {/* Action Buttons Hub (Mobile Sticky CTA & Top Bar) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Download Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 min-h-[46px]"
          >
            <Download className="w-4 h-4" />
            <span>حفظ كصورة (PNG)</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-stone-900/10 disabled:opacity-50 min-h-[46px]"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>حفظ كملف PDF</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-800 font-semibold rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50 min-h-[46px]"
          >
            <Share2 className="w-4 h-4 text-stone-600" />
            <span>مشاركة للجوال</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-800 font-semibold rounded-xl text-xs sm:text-sm transition-all min-h-[46px]"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>طباعة فورية</span>
          </button>
        </div>
      </div>

      {/* Style & Content Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs mb-6 space-y-4">
        {/* Theme Chooser */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>نمط التصميم والسمة اللونية</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    opt.previewClass
                  } ${
                    isSelected
                      ? 'ring-2 ring-amber-500 border-amber-500 shadow-sm scale-[1.01]'
                      : 'hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold font-cairo">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <span className="text-[10px] opacity-75 leading-tight">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Toggles */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-stone-700">
            <input
              type="checkbox"
              checked={showSpouses}
              onChange={(e) => setShowSpouses(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
            />
            <span>إظهار أسماء الزوجات / الأزواج</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-stone-700">
            <input
              type="checkbox"
              checked={showDates}
              onChange={(e) => setShowDates(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
            />
            <span>إظهار سنوات الميلاد</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-stone-700">
            <input
              type="checkbox"
              checked={showGenerations}
              onChange={(e) => setShowGenerations(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
            />
            <span>إظهار مستويات الأجيال على الأطراف</span>
          </label>
        </div>
      </div>

      {/* Live Poster Preview Container */}
      <div className="bg-stone-200/70 p-3 sm:p-6 rounded-3xl border border-stone-300/80 shadow-inner overflow-hidden">
        <div className="text-center mb-3 flex items-center justify-between px-2">
          <span className="text-xs font-bold text-stone-600">معاينة اللوحة النهائية للطباعة والتصدير</span>
          {isRenderingPreview && (
            <span className="text-xs text-amber-700 flex items-center gap-1 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" />
              جاري تحديث المعاينة...
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-stone-300 overflow-auto max-h-[70vh] flex items-center justify-center p-2 sm:p-4">
          {previewDataUrl ? (
            <img
              src={previewDataUrl}
              alt="معاينة شجرة العائلة"
              className="max-w-full h-auto object-contain rounded-lg shadow-sm"
            />
          ) : (
            <div className="py-20 text-center text-stone-400 text-sm">
              جاري توليد شجرة العائلة...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
