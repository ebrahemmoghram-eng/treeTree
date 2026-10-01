export type Gender = 'male' | 'female';

export interface Person {
  id: string;
  name: string;
  title?: string; // لقب أو كنية مثلا "أبو أحمد"
  gender: Gender;
  parentId?: string | null;
  spouse?: string; // اسم الزوجة أو الزوج
  childrenIds: string[];
  birthYear?: string;
  notes?: string;
  branchColor?: string; // لون مخصص لهذا الفرع
  isDeceased?: boolean;
}

export interface FamilyTree {
  id: string;
  title: string;
  subtitle?: string;
  rootId: string;
  members: Record<string, Person>;
  updatedAt: string;
}

export interface BranchColorDef {
  id: string;
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export type PosterTheme = 'royal_parchment' | 'emerald_heritage' | 'midnight_luxury' | 'pure_minimal';

export type AppTab = 'list' | 'diagram' | 'poster' | 'stats';
