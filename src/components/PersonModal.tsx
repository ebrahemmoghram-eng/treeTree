import React, { useState, useEffect } from 'react';
import { X, User, Heart, Calendar, Palette, Check } from 'lucide-react';
import { Person, Gender } from '../types/family';
import { BRANCH_COLORS } from '../utils/initialData';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Partial<Person>) => void;
  person?: Person | null;
  parentPerson?: Person | null;
  mode: 'add' | 'edit';
  isRootLevel?: boolean;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  person,
  parentPerson,
  mode,
  isRootLevel = false,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [spouse, setSpouse] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [notes, setNotes] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [branchColor, setBranchColor] = useState<string>('#059669');

  useEffect(() => {
    if (person && mode === 'edit') {
      setName(person.name || '');
      setTitle(person.title || '');
      setGender(person.gender || 'male');
      setSpouse(person.spouse || '');
      setBirthYear(person.birthYear || '');
      setNotes(person.notes || '');
      setIsDeceased(Boolean(person.isDeceased));
      setBranchColor(person.branchColor || '#059669');
    } else {
      setName('');
      setTitle('');
      setGender('male');
      setSpouse('');
      setBirthYear('');
      setNotes('');
      setIsDeceased(false);
      setBranchColor(parentPerson?.branchColor || '#059669');
    }
  }, [person, parentPerson, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      title: title.trim() || undefined,
      gender,
      spouse: spouse.trim() || undefined,
      birthYear: birthYear.trim() || undefined,
      notes: notes.trim() || undefined,
      isDeceased,
      branchColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Grab Handle for mobile */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-cairo">
              {mode === 'add'
                ? parentPerson
                  ? `إضافة فرع / ابن لـ ${parentPerson.name}`
                  : 'إضافة شخص جديد'
                : `تعديل بيانات: ${person?.name}`}
            </h3>
            {parentPerson && mode === 'add' && (
              <p className="text-xs text-stone-500 mt-0.5">
                سيتفرع هذا الفرد تلقائياً من عائلة الأب
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-right flex-1">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              الاسم الكامل <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمد بن عبد الله"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 placeholder:text-stone-400"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Gender & Title / Nickname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">الجنس</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    gender === 'male'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    gender === 'female'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                اللقب أو الكنية
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: أبو فهد"
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          {/* Spouse & Birth Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={spouse}
                  onChange={(e) => setSpouse(e.target.value)}
                  placeholder="مثال: نورة بنت فهد"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
                <Heart className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">سنة الميلاد</label>
              <div className="relative">
                <input
                  type="text"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="مثال: 1985 م أو 1405 هـ"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Branch Color Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-stone-500" />
                <span>لون الفرع في شجرة العائلة</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                يميز فروع العائلة بألوان جميلة
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
              {BRANCH_COLORS.map((col) => {
                const isSelected = branchColor === col.hex;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setBranchColor(col.hex)}
                    style={{ backgroundColor: col.hex }}
                    className={`h-9 rounded-xl flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'ring-2 ring-stone-900 ring-offset-2 scale-105 shadow-md'
                        : 'hover:scale-95 opacity-85 hover:opacity-100'
                    }`}
                    title={col.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deceased checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDeceased"
              checked={isDeceased}
              onChange={(e) => setIsDeceased(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
            />
            <label htmlFor="isDeceased" className="text-xs font-medium text-stone-700 cursor-pointer">
              متوفى (رحمه الله / يظهر وسم الترحم في اللوحة)
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              ملاحظات أو نبذة مختصرة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: الإقامة في الرياض، اهتماماته، سيرة موجزة..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-2.5">
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
            >
              {mode === 'add' ? 'إضافة إلى الشجرة' : 'حفظ التعديلات'}
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
