import jsPDF from 'jspdf';
import { FamilyTree } from '../types/family';
import { buildDiagramLayout, computeBranchColors, computeGenerations, getGenerationName } from './treeLayout';

export interface RenderOptions {
  theme: 'royal_parchment' | 'emerald_heritage' | 'midnight_luxury' | 'pure_minimal';
  showSpouses: boolean;
  showDates: boolean;
  showGenerations: boolean;
  scale?: number;
}

/**
 * Draws the family tree on an HTML5 canvas with ultra-high resolution
 */
export const renderFamilyTreeToCanvas = async (
  tree: FamilyTree,
  options: RenderOptions
): Promise<HTMLCanvasElement> => {
  const { theme, showSpouses, showDates, showGenerations, scale = 2 } = options;

  // Compute layout
  const nodeWidth = 200;
  const nodeHeight = showSpouses ? 95 : 80;
  const horizontalGap = 32;
  const verticalGap = 90;

  const layout = buildDiagramLayout(tree, nodeWidth, nodeHeight, horizontalGap, verticalGap);
  const branchColors = computeBranchColors(tree);
  const generations = computeGenerations(tree);

  // Canvas dimensions with header and footer margins
  const headerHeight = 220;
  const footerHeight = 100;
  const sideMargin = 120;

  const width = Math.max(layout.totalWidth + sideMargin * 2, 1200);
  const height = layout.totalHeight + headerHeight + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(scale, scale);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // --- Background Styling by Theme ---
  if (theme === 'midnight_luxury') {
    // Dark luxury obsidian
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle star / dust pattern or grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  } else if (theme === 'emerald_heritage') {
    // Deep emerald wash
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#062e24');
    bgGrad.addColorStop(1, '#021c15');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle arabesque geometric overlay
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 80; r < width; r += 120) {
      ctx.beginPath();
      ctx.arc(r, height / 2, 60, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (theme === 'royal_parchment') {
    // Warm vintage parchment
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#fdfbf7');
    bgGrad.addColorStop(0.5, '#f7f2e8');
    bgGrad.addColorStop(1, '#efe7d6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grain texture simulation
    ctx.fillStyle = 'rgba(180, 140, 90, 0.04)';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 2, 2);
    }
  } else {
    // Pure minimal clean
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);
  }

  // --- Decorative Border Frames ---
  const isDark = theme === 'midnight_luxury' || theme === 'emerald_heritage';
  const borderCol1 = isDark ? '#d97706' : '#b45309';
  const borderCol2 = isDark ? 'rgba(217, 119, 6, 0.3)' : 'rgba(180, 83, 9, 0.25)';

  // Outer border
  ctx.strokeStyle = borderCol1;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner thin border
  ctx.strokeStyle = borderCol2;
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // Corner decorative flourishes
  const drawCornerFlourish = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = borderCol1;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, 35);
    ctx.lineTo(10, 10);
    ctx.lineTo(35, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(20, 20, 5, 0, Math.PI * 2);
    ctx.fillStyle = borderCol1;
    ctx.fill();
    ctx.restore();
  };

  drawCornerFlourish(38, 38, 1, 1);
  drawCornerFlourish(width - 38, 38, -1, 1);
  drawCornerFlourish(38, height - 38, 1, -1);
  drawCornerFlourish(width - 38, height - 38, -1, -1);

  // --- Header Area ---
  const headerCenterX = width / 2;

  // Basmalah / invocation
  ctx.font = '20px "Amiri", serif';
  ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
  ctx.fillText('بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ', headerCenterX, 70);

  // Decorative Crest emblem (center medallion)
  ctx.beginPath();
  ctx.arc(headerCenterX, 105, 18, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)';
  ctx.fill();
  ctx.strokeStyle = isDark ? '#fbbf24' : '#d97706';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Emblem crown star
  ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
  ctx.font = '16px "Cairo", sans-serif';
  ctx.fillText('✦', headerCenterX, 105);

  // Title
  ctx.font = 'bold 36px "Amiri", "Cairo", serif';
  ctx.fillStyle = isDark ? '#f8fafc' : '#1c1917';
  ctx.fillText(tree.title, headerCenterX, 145);

  // Subtitle
  if (tree.subtitle) {
    ctx.font = '16px "Cairo", sans-serif';
    ctx.fillStyle = isDark ? '#94a3b8' : '#78716c';
    ctx.fillText(tree.subtitle, headerCenterX, 180);
  }

  // Horizontal divider under header
  ctx.strokeStyle = borderCol2;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(headerCenterX - 250, 205);
  ctx.lineTo(headerCenterX + 250, 205);
  ctx.stroke();

  // Offset diagram by header height and center offset
  const offsetX = (width - layout.totalWidth) / 2;
  const offsetY = headerHeight;

  // --- Draw Connecting Lines First ---
  layout.links.forEach((link) => {
    const startX = link.fromX + offsetX;
    const startY = link.fromY + offsetY;
    const endX = link.toX + offsetX;
    const endY = link.toY + offsetY;

    ctx.strokeStyle = isDark ? link.color : link.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    // Smooth Bezier Curve connecting ancestor to descendant
    const midY = (startY + endY) / 2;
    ctx.bezierCurveTo(startX, midY, endX, midY, endX, endY);
    ctx.stroke();

    // Small junction circle at child top
    ctx.fillStyle = link.color;
    ctx.beginPath();
    ctx.arc(endX, endY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // --- Draw Nodes ---
  layout.nodes.forEach((node) => {
    const nx = node.x + offsetX;
    const ny = node.y + offsetY;
    const nw = node.width;
    const nh = node.height;
    const p = node.person;
    const isRoot = p.id === tree.rootId;
    const bColor = node.branchColor;

    // Node card background
    ctx.save();
    
    // Rounded rectangle path
    const radius = 12;
    ctx.beginPath();
    ctx.roundRect(nx, ny, nw, nh, radius);

    // Fill style
    if (isDark) {
      ctx.fillStyle = isRoot ? '#1e293b' : '#141e30';
    } else {
      ctx.fillStyle = isRoot ? '#fefce8' : '#ffffff';
    }
    ctx.fill();

    // Node Border
    ctx.strokeStyle = isRoot ? '#f59e0b' : bColor;
    ctx.lineWidth = isRoot ? 3 : 2;
    ctx.stroke();

    // Top color accent bar
    ctx.beginPath();
    ctx.roundRect(nx, ny, nw, 6, [radius, radius, 0, 0]);
    ctx.fillStyle = isRoot ? '#d97706' : bColor;
    ctx.fill();

    // Person Name
    ctx.font = isRoot ? 'bold 17px "Cairo", sans-serif' : 'bold 15px "Cairo", sans-serif';
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1c1917';
    ctx.textAlign = 'center';
    
    const nameY = ny + (nh > 85 ? 30 : 28);
    ctx.fillText(p.name, nx + nw / 2, nameY);

    // Title / Nickname or Generation tag
    let currentY = nameY + 22;
    if (p.title) {
      ctx.font = '12px "Cairo", sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#57534e';
      ctx.fillText(p.title, nx + nw / 2, currentY);
      currentY += 18;
    }

    // Spouse (if present and enabled)
    if (showSpouses && p.spouse) {
      ctx.font = '11px "Cairo", sans-serif';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#44403c';
      ctx.fillText(`الزوجة: ${p.spouse}`, nx + nw / 2, currentY);
      currentY += 16;
    }

    // Birth year / era (if present and enabled)
    if (showDates && p.birthYear) {
      ctx.font = '11px "Cairo", sans-serif';
      ctx.fillStyle = isDark ? '#64748b' : '#a8a29e';
      ctx.fillText(`م: ${p.birthYear} م`, nx + nw / 2, currentY);
    }

    // Deceased mark indicator (e.g. رحمه الله)
    if (p.isDeceased) {
      ctx.font = '10px "Cairo", sans-serif';
      ctx.fillStyle = isDark ? '#e0b980' : '#854d0e';
      ctx.fillText('رحمه الله', nx + nw / 2, ny + nh - 10);
    }

    ctx.restore();
  });

  // --- Generation Indicators (Left/Right rail) ---
  if (showGenerations) {
    const maxGen = Math.max(...Object.values(generations), 1);
    const genYMap: Record<number, number> = {};
    layout.nodes.forEach((n) => {
      if (!genYMap[n.generation]) {
        genYMap[n.generation] = n.y + offsetY + n.height / 2;
      }
    });

    for (let g = 1; g <= maxGen; g++) {
      const gy = genYMap[g];
      if (gy) {
        ctx.font = 'bold 12px "Cairo", sans-serif';
        ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
        ctx.textAlign = 'right';
        ctx.fillText(getGenerationName(g), width - 60, gy);

        ctx.textAlign = 'left';
        ctx.fillText(`الجيل ${g}`, 60, gy);
      }
    }
  }

  // --- Footer Notice / Brand ---
  const footerY = height - 55;
  ctx.textAlign = 'center';
  ctx.font = '12px "Cairo", sans-serif';
  ctx.fillStyle = isDark ? '#64748b' : '#a8a29e';
  ctx.fillText('تم إنشاؤها عبر تطبيق «سلسال» لشجرة العائلة المباركة · تم الحفظ بتاريخ ' + new Date().toLocaleDateString('ar-SA'), headerCenterX, footerY);

  return canvas;
};

/**
 * Downloads the tree directly as a high-resolution PNG image
 */
export const downloadTreeAsImage = async (
  tree: FamilyTree,
  options: RenderOptions
): Promise<void> => {
  const canvas = await renderFamilyTreeToCanvas(tree, options);
  const dataUrl = canvas.toDataURL('image/png', 1.0);

  const link = document.createElement('a');
  link.download = `${tree.title.replace(/\s+/g, '_')}_شجرة_العائلة.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Downloads the tree directly as a high-quality PDF
 */
export const downloadTreeAsPdf = async (
  tree: FamilyTree,
  options: RenderOptions
): Promise<void> => {
  const canvas = await renderFamilyTreeToCanvas(tree, options);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Determine PDF orientation based on aspect ratio
  const isLandscape = imgWidth >= imgHeight;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [imgWidth, imgHeight],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdf.save(`${tree.title.replace(/\s+/g, '_')}_شجرة_العائلة.pdf`);
};

/**
 * Web Share API support for mobile devices
 */
export const shareTreeImage = async (
  tree: FamilyTree,
  options: RenderOptions
): Promise<boolean> => {
  try {
    const canvas = await renderFamilyTreeToCanvas(tree, options);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;

    const file = new File([blob], `${tree.title.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: tree.title,
        text: `شجرة عائلة: ${tree.title}`,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title: tree.title,
        text: `شجرة عائلة: ${tree.title}`,
        url: window.location.href,
      });
      return true;
    }
  } catch (err) {
    console.error('Error sharing image', err);
  }
  return false;
};
