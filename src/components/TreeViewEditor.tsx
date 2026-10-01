import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  Maximize2,
  Minimize2,
  Heart,
  Crown,
  Share2,
} from 'lucide-react';
import { FamilyTree, Person } from '../types/family';
import { computeBranchColors, computeGenerations, getGenerationName } from '../utils/treeLayout';

interface TreeViewEditorProps {
  tree: FamilyTree;
  onUpdateTree: (tree: FamilyTree) => void;
  onAddChild: (parentPerson: Person) => void;
  onBulkAddChildren: (parentPerson: Person) => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
  onTitleChange: (title: string, subtitle?: string) => void;
}

export const TreeViewEditor: React.FC<TreeViewEditorProps> = ({
  tree,
  onAddChild,
  onBulkAddChildren,
  onEditPerson,
  onDeletePerson,
  onTitleChange,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [tree.rootId]: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(tree.title);
  const [tempSubtitle, setTempSubtitle] = useState(tree.subtitle || '');

  const root = tree.members[tree.rootId];
  const branchColors = computeBranchColors(tree);
  const generations = computeGenerations(tree);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    Object.keys(tree.members).forEach((id) => {
      all[id] = true;
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({ [tree.rootId]: true });
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim(), tempSubtitle.trim());
      setEditingTitle(false);
    }
  };

  // Recursive renderer for member and their descendants
  const renderFamilyNode = (personId: string, depth = 0) => {
    const person = tree.members[personId];
    if (!person) return null;

    const isRoot = personId === tree.rootId;
    const hasChildren = person.childrenIds.length > 0;
    const isExpanded = expandedNodes[personId] ?? true;
    const branchColor = branchColors[personId] || '#059669';
    const gen = generations[personId] || 1;

    // Search filter check
    const matchesSearch =
      !searchQuery ||
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.title && person.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (person.spouse && person.spouse.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div key={person.id} className="relative transition-all">
        {/* Connection line for nested cards */}
        {depth > 0 && (
          <div
            className="absolute right-[-18px] top-6 w-4.5 h-0.5 border-t border-stone-300"
            style={{ borderColor: branchColor }}
          />
        )}

        {/* Person Card */}
        <div
          className={`rounded-2xl border transition-all mb-3 overflow-hidden ${
            isRoot
              ? 'bg-gradient-to-r from-amber-50 to-stone-50 border-amber-300 shadow-md ring-1 ring-amber-400/20'
              : 'bg-white border-stone-200/80 shadow-xs hover:border-stone-300'
          } ${matchesSearch ? 'opacity-100' : 'opacity-40'}`}
        >
          {/* Color strip on side/top */}
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: isRoot ? '#d97706' : branchColor }}
          />

          <div className="p-3.5 sm:p-4">
            {/* Top row: Badges and expand button */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {isRoot ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                    <Crown className="w-3 h-3 text-amber-700" />
                    الجد الأكبر المؤسس
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-stone-500">
                    {getGenerationName(gen)}
                  </span>
                )}

                {person.gender === 'female' && (
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                    أنثى
                  </span>
                )}
                {person.isDeceased && (
                  <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    رحمه الله
                  </span>
                )}
              </div>

              {/* Expand / Collapse toggle */}
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(person.id)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <span className="font-cairo text-[11px]">
                    {person.childrenIds.length} {person.childrenIds.length > 2 ? 'أبناء' : 'ابن'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Middle row: Name and details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-cairo">
                    {person.name}
                  </h3>
                  {person.title && (
                    <span className="text-xs text-stone-500 font-normal">
                      ({person.title})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1">
                  {person.spouse && (
                    <div className="flex items-center gap-1 text-stone-700">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>{person.gender === 'female' ? 'الزوج: ' : 'الزوجة: '}</span>
                      <span className="font-semibold">{person.spouse}</span>
                    </div>
                  )}

                  {person.birthYear && (
                    <span className="text-stone-400">
                      سنة الميلاد: {person.birthYear}
                    </span>
                  )}

                  {person.notes && (
                    <span className="text-stone-400 italic">
                      · {person.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons with accessible hitboxes >= 44px */}
              <div className="flex items-center gap-1 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <button
                  type="button"
                  onClick={() => onAddChild(person)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-bold transition-colors min-h-[38px]"
                  title="إضافة ابن / فرع"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>إضافة فرع</span>
                </button>

                <button
                  type="button"
                  onClick={() => onBulkAddChildren(person)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors min-h-[38px]"
                  title="إضافة دفعة أبناء مرة واحدة"
                >
                  <Users className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden xs:inline">دفعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditPerson(person)}
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="تعديل البيانات"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {!isRoot && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${person.name} وفروعه؟`)) {
                        onDeletePerson(person.id);
                      }
                    }}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="حذف هذا الفرد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Children Sub-tree (Recursive) */}
        {hasChildren && isExpanded && (
          <div className="pr-4 sm:pr-6 border-r-2 border-dashed border-stone-200 mr-2 sm:mr-3 space-y-2 mt-1 mb-2">
            {person.childrenIds.map((childId) => renderFamilyNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto">
      {/* Title & Tree Name Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs mb-4">
        {editingTitle ? (
          <form onSubmit={handleSaveTitle} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                عنوان شجرة العائلة
              </label>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="مثال: شجرة عائلة آل عبد الله المباركة"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                الوصف أو الشعار
              </label>
              <input
                type="text"
                value={tempSubtitle}
                onChange={(e) => setTempSubtitle(e.target.value)}
                placeholder="مثال: من الجد المؤسس وصولاً إلى الجيل المعاصر"
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
              >
                حفظ العنوان
              </button>
              <button
                type="button"
                onClick={() => setEditingTitle(false)}
                className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium"
              >
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-cairo">
                {tree.title}
              </h2>
              {tree.subtitle && (
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  {tree.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={() => setEditingTitle(true)}
              className="p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="تعديل اسم الشجرة"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Control bar: Search + Expand/Collapse All */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الزوجة أو اللقب..."
            className="w-full pr-9 pl-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
        </div>

        {/* Expand / Collapse buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={expandAll}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 hover:bg-stone-50 font-medium transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
            <span>توسيع الكل</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 hover:bg-stone-50 font-medium transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5 text-stone-500" />
            <span>طي الكل</span>
          </button>
        </div>
      </div>

      {/* Family Hierarchy Nodes */}
      {root ? (
        <div className="space-y-1">
          {renderFamilyNode(root.id, 0)}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
          لم يتم العثور على الجد الرئيسي. يرجى إنشاء شجرة جديدة.
        </div>
      )}
    </div>
  );
};
