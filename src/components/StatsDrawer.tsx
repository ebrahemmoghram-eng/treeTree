import React, { useState, useRef } from 'react';
import {
  Users,
  Layers,
  Heart,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle,
  FolderPlus,
} from 'lucide-react';
import { FamilyTree, Person } from '../types/family';
import { calculateTreeStats, getGenerationName } from '../utils/treeLayout';
import { exportTreeToJson } from '../utils/storage';

interface StatsDrawerProps {
  tree: FamilyTree;
  onSelectPerson: (person: Person) => void;
  onImportTree: (tree: FamilyTree) => void;
  onNewTree: () => void;
  onResetSample: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  tree,
  onSelectPerson,
  onImportTree,
  onNewTree,
  onResetSample,
}) => {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stats = calculateTreeStats(tree);

  const filteredMembers = Object.values(tree.members).filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      (m.spouse && m.spouse.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.rootId) {
          onImportTree(parsed);
        } else {
          alert('ملف غير صالح، يجب أن يحتوي على شجرة عائلة متوافقة.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-5">
      {/* Top Title */}
      <div className="text-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-amiri">
          إحصائيات وأنساب العائلة
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          نظرة شاملة على تفرعات الشجرة، الأجيال، وأعداد الأفراد
        </p>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs text-stone-500">إجمالي الأفراد</p>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo mt-0.5">
            {stats.totalMembers}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-xs text-stone-500">عدد الأجيال</p>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo mt-0.5">
            {stats.totalGenerations}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-xs text-stone-500">الذكور</p>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo mt-0.5">
            {stats.maleCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-2">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-xs text-stone-500">الإناث</p>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo mt-0.5">
            {stats.femaleCount}
          </p>
        </div>
      </div>

      {/* Branches Breakdown */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900 font-cairo flex items-center gap-1.5">
          <span>توزيع الفروع الرئيسية للجد</span>
          <span className="text-xs text-stone-400 font-normal">
            ({stats.branchStats.length} فروع)
          </span>
        </h3>

        <div className="space-y-2.5">
          {stats.branchStats.map((branch) => {
            const percentage =
              stats.totalMembers > 1
                ? Math.round((branch.count / (stats.totalMembers - 1)) * 100)
                : 100;

            return (
              <div key={branch.branchId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: branch.color }}
                    />
                    <span className="font-bold text-stone-800">{branch.branchName}</span>
                  </div>
                  <div className="text-stone-500 font-medium">
                    {branch.count} فرد ({percentage}%)
                  </div>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: branch.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Directory */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 font-cairo">
            دليل أفراد العائلة
          </h3>
          <span className="text-xs text-stone-400">
            {filteredMembers.length} من {stats.totalMembers}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم الكامل أو الزوجة..."
            className="w-full pr-9 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
        </div>

        <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectPerson(member)}
              className="w-full py-2.5 px-2 flex items-center justify-between hover:bg-stone-50 rounded-xl transition-colors text-right"
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900 font-cairo">
                  {member.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  {member.title && <span>{member.title}</span>}
                  {member.spouse && <span>الزوجة: {member.spouse}</span>}
                  {member.birthYear && <span>م: {member.birthYear}</span>}
                </div>
              </div>
              <div className="text-left">
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  {member.childrenIds.length} فروع
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Backup & Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900 font-cairo">
          النسخ الاحتياطي وإدارة الشجرة
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => exportTreeToJson(tree)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>تصدير ملف بيانات الشجرة (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
          >
            <Upload className="w-4 h-4 text-stone-600" />
            <span>استيراد ملف شجرة محفوظ</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={onNewTree}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-amber-600" />
            <span>بدء شجرة عائلة جديدة من الصفر</span>
          </button>

          <button
            onClick={onResetSample}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تحميل الشجرة التجريبية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
