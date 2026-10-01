import React from 'react';
import { ListTree, Network, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { AppTab } from '../types/family';

interface BottomNavProps {
  currentTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'list' as AppTab,
      label: 'شجرة القوائم',
      icon: ListTree,
      badge: 'إدخال الفروع',
    },
    {
      id: 'diagram' as AppTab,
      label: 'المخطط البياني',
      icon: Network,
      badge: 'تفاعلي',
    },
    {
      id: 'poster' as AppTab,
      label: 'اللوحة والتصدير',
      icon: ImageIcon,
      badge: 'صورة و PDF',
    },
    {
      id: 'stats' as AppTab,
      label: 'الإحصائيات',
      icon: BarChart3,
      badge: 'النسب والأجيال',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative ${
                isActive ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[80px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
