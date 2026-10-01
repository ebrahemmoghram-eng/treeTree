import { FamilyTree } from '../types/family';
import { sampleFamilyTree } from './initialData';

const STORAGE_KEY = 'selsal_family_tree_v1';
const SAVED_TREES_KEY = 'selsal_saved_trees_list_v1';

export const loadCurrentTree = (): FamilyTree => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.members && parsed.rootId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load tree from localStorage', e);
  }
  return sampleFamilyTree;
};

export const saveCurrentTree = (tree: FamilyTree): void => {
  try {
    const updated = { ...tree, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save tree to localStorage', e);
  }
};

export const resetToSampleTree = (): FamilyTree => {
  saveCurrentTree(sampleFamilyTree);
  return sampleFamilyTree;
};

export const exportTreeToJson = (tree: FamilyTree): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tree, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${tree.title.replace(/\s+/g, '_')}_data.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
