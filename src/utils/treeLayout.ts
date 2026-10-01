import { FamilyTree, Person } from '../types/family';
import { BRANCH_COLORS, getBranchColorByIndex } from './initialData';

export interface TreeNodeLayout {
  person: Person;
  x: number;
  y: number;
  width: number;
  height: number;
  generation: number;
  branchColor: string;
  branchName?: string;
  children: TreeNodeLayout[];
}

export interface TreeStats {
  totalMembers: number;
  totalGenerations: number;
  maleCount: number;
  femaleCount: number;
  deceasedCount: number;
  branchStats: {
    branchId: string;
    branchName: string;
    color: string;
    count: number;
  }[];
}

// Generation names in Arabic
export const getGenerationName = (gen: number): string => {
  switch (gen) {
    case 1:
      return 'الجيل الأول (الجد المؤسس)';
    case 2:
      return 'الجيل الثاني (الأبناء والبنات)';
    case 3:
      return 'الجيل الثالث (الأحفاد)';
    case 4:
      return 'الجيل الرابع (أبناء الأحفاد)';
    case 5:
      return 'الجيل الخامس (أحفاد الأحفاد)';
    case 6:
      return 'الجيل السادس';
    default:
      return `الجيل ${gen}`;
  }
};

/**
 * Returns a map of personId -> inherited branch color
 */
export const computeBranchColors = (tree: FamilyTree): Record<string, string> => {
  const result: Record<string, string> = {};
  const root = tree.members[tree.rootId];
  if (!root) return result;

  result[root.id] = root.branchColor || '#059669';

  // For each primary child of the root, assign a distinct palette color
  root.childrenIds.forEach((childId, index) => {
    const child = tree.members[childId];
    if (!child) return;
    const branchColor = child.branchColor || getBranchColorByIndex(index).hex;
    result[childId] = branchColor;

    // Propagate to all descendants
    const assignDescendants = (parentId: string, color: string) => {
      const parent = tree.members[parentId];
      if (!parent) return;
      parent.childrenIds.forEach((cId) => {
        const c = tree.members[cId];
        if (c) {
          result[cId] = c.branchColor || color;
          assignDescendants(cId, color);
        }
      });
    };

    assignDescendants(childId, branchColor);
  });

  return result;
};

/**
 * Calculate depths / generation for every member
 */
export const computeGenerations = (tree: FamilyTree): Record<string, number> => {
  const generations: Record<string, number> = {};
  const root = tree.members[tree.rootId];
  if (!root) return generations;

  const traverse = (personId: string, currentGen: number) => {
    generations[personId] = currentGen;
    const person = tree.members[personId];
    if (!person) return;
    person.childrenIds.forEach((cId) => {
      traverse(cId, currentGen + 1);
    });
  };

  traverse(root.id, 1);
  return generations;
};

/**
 * Compute statistics of the family tree
 */
export const calculateTreeStats = (tree: FamilyTree): TreeStats => {
  const members = Object.values(tree.members);
  const totalMembers = members.length;
  const maleCount = members.filter((m) => m.gender === 'male').length;
  const femaleCount = members.filter((m) => m.gender === 'female').length;
  const deceasedCount = members.filter((m) => m.isDeceased).length;

  const gens = computeGenerations(tree);
  const totalGenerations = Math.max(...Object.values(gens), 1);

  const root = tree.members[tree.rootId];
  const branchColors = computeBranchColors(tree);

  const branchStats = (root?.childrenIds || []).map((branchId, idx) => {
    const branchPerson = tree.members[branchId];
    const color = branchColors[branchId] || getBranchColorByIndex(idx).hex;
    
    // Count all descendants in this branch
    let count = 0;
    const countBranch = (pid: string) => {
      count++;
      const p = tree.members[pid];
      if (p) {
        p.childrenIds.forEach((cid) => countBranch(cid));
      }
    };
    if (branchPerson) {
      countBranch(branchId);
    }

    return {
      branchId,
      branchName: branchPerson ? branchPerson.name : `فرع ${idx + 1}`,
      color,
      count,
    };
  });

  return {
    totalMembers,
    totalGenerations,
    maleCount,
    femaleCount,
    deceasedCount,
    branchStats,
  };
};

/**
 * Layout calculation for visual SVG diagram
 * Produces clean coordinates with automatic spacing
 */
export const buildDiagramLayout = (
  tree: FamilyTree,
  nodeWidth = 190,
  nodeHeight = 85,
  horizontalGap = 28,
  verticalGap = 85
): {
  nodes: (TreeNodeLayout & { id: string })[];
  links: { fromX: number; fromY: number; toX: number; toY: number; color: string; id: string }[];
  totalWidth: number;
  totalHeight: number;
} => {
  const root = tree.members[tree.rootId];
  if (!root) {
    return { nodes: [], links: [], totalWidth: 600, totalHeight: 400 };
  }

  const branchColors = computeBranchColors(tree);
  const generations = computeGenerations(tree);

  // Measure tree width recursively
  const getSubtreeWidth = (personId: string): number => {
    const person = tree.members[personId];
    if (!person || person.childrenIds.length === 0) {
      return nodeWidth;
    }
    const childrenWidths = person.childrenIds.map((cId) => getSubtreeWidth(cId));
    const totalChildWidth =
      childrenWidths.reduce((sum, w) => sum + w, 0) + (childrenWidths.length - 1) * horizontalGap;
    return Math.max(nodeWidth, totalChildWidth);
  };

  const nodes: (TreeNodeLayout & { id: string })[] = [];
  const links: { fromX: number; fromY: number; toX: number; toY: number; color: string; id: string }[] = [];

  let maxY = 0;

  const positionNode = (personId: string, leftX: number, availableWidth: number, y: number): TreeNodeLayout => {
    const person = tree.members[personId];
    const nodeX = leftX + (availableWidth - nodeWidth) / 2;
    const nodeY = y;
    const gen = generations[personId] || 1;
    const color = branchColors[personId] || '#059669';

    maxY = Math.max(maxY, nodeY + nodeHeight);

    const layoutNode: TreeNodeLayout & { id: string } = {
      id: personId,
      person,
      x: nodeX,
      y: nodeY,
      width: nodeWidth,
      height: nodeHeight,
      generation: gen,
      branchColor: color,
      children: [],
    };
    nodes.push(layoutNode);

    if (person && person.childrenIds.length > 0) {
      const childSubtreeWidths = person.childrenIds.map((cId) => getSubtreeWidth(cId));
      const totalWidthAllChildren =
        childSubtreeWidths.reduce((a, b) => a + b, 0) + (person.childrenIds.length - 1) * horizontalGap;

      let currentChildLeft = leftX + (availableWidth - totalWidthAllChildren) / 2;
      const childY = y + nodeHeight + verticalGap;

      person.childrenIds.forEach((childId, idx) => {
        const childWidth = childSubtreeWidths[idx];
        const childLayout = positionNode(childId, currentChildLeft, childWidth, childY);
        layoutNode.children.push(childLayout);

        // Add connecting link (from bottom center of parent to top center of child)
        links.push({
          id: `${personId}-${childId}`,
          fromX: nodeX + nodeWidth / 2,
          fromY: nodeY + nodeHeight,
          toX: childLayout.x + nodeWidth / 2,
          toY: childLayout.y,
          color: branchColors[childId] || color,
        });

        currentChildLeft += childWidth + horizontalGap;
      });
    }

    return layoutNode;
  };

  const rootSubtreeWidth = getSubtreeWidth(root.id);
  const paddingX = 80;
  const paddingY = 60;
  positionNode(root.id, paddingX, rootSubtreeWidth, paddingY);

  const totalWidth = rootSubtreeWidth + paddingX * 2;
  const totalHeight = maxY + paddingY * 2;

  return { nodes, links, totalWidth, totalHeight };
};
