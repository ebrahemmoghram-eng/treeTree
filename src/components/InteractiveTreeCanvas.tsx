import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Edit2, Heart, User, Sparkles } from 'lucide-react';
import { FamilyTree, Person } from '../types/family';
import { buildDiagramLayout, computeBranchColors, computeGenerations } from '../utils/treeLayout';

interface InteractiveTreeCanvasProps {
  tree: FamilyTree;
  onSelectPerson: (person: Person) => void;
  onAddChild: (parentPerson: Person) => void;
}

export const InteractiveTreeCanvas: React.FC<InteractiveTreeCanvasProps> = ({
  tree,
  onSelectPerson,
  onAddChild,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const layout = buildDiagramLayout(tree, 190, 85, 28, 85);
  const branchColors = computeBranchColors(tree);

  // Auto-center root when component mounts
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const initialX = (containerWidth - layout.totalWidth * scale) / 2;
      setPosition({ x: initialX, y: 40 });
    }
  }, [tree.rootId]);

  // Touch and mouse dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking on button
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(0.85);
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setPosition({ x: (containerWidth - layout.totalWidth * 0.85) / 2, y: 40 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-stone-100 overflow-hidden select-none pb-16">
      {/* Zoom / View Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-stone-200">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.15, 1.8))}
          className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="تكبير"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.15, 0.4))}
          className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="تصغير"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="إعادة ضبط الرؤية"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Canvas Hint */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-600 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>اسحب للتحريك · انقر على أي شخص للتفاصيل</span>
      </div>

      {/* Interactive Drag Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: layout.totalWidth,
            height: layout.totalHeight,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative"
        >
          {/* SVG Links Layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={layout.totalWidth}
            height={layout.totalHeight}
          >
            {layout.links.map((link) => {
              const midY = (link.fromY + link.toY) / 2;
              const pathD = `M ${link.fromX} ${link.fromY} C ${link.fromX} ${midY}, ${link.toX} ${midY}, ${link.toX} ${link.toY}`;
              return (
                <g key={link.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={link.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
                  <circle cx={link.toX} cy={link.toY} r="3" fill={link.color} />
                </g>
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          {layout.nodes.map((node) => {
            const p = node.person;
            const isRoot = p.id === tree.rootId;
            const bColor = node.branchColor;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  borderColor: isRoot ? '#d97706' : bColor,
                }}
                className={`group rounded-xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  isRoot
                    ? 'bg-amber-50/95 border-amber-500'
                    : 'bg-white hover:border-amber-400'
                }`}
                onClick={() => onSelectPerson(p)}
              >
                {/* Branch Color Ribbon */}
                <div
                  className="h-1.5 w-full rounded-t-[10px]"
                  style={{ backgroundColor: isRoot ? '#d97706' : bColor }}
                />

                <div className="p-2 text-center flex flex-col justify-between h-[calc(100%-6px)]">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate font-cairo">
                      {p.name}
                    </h4>

                    {p.title && (
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {p.title}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                    <span className="truncate">
                      {p.gender === 'female' ? 'أنثى' : 'ذكر'}
                      {p.spouse ? ` · ${p.spouse}` : ''}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddChild(p);
                      }}
                      className="p-1 text-stone-400 hover:text-amber-600 rounded hover:bg-stone-100 transition-colors"
                      title="إضافة ابن لهذا الشخص"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
