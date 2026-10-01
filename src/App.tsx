import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TreeViewEditor } from './components/TreeViewEditor';
import { InteractiveTreeCanvas } from './components/InteractiveTreeCanvas';
import { HeritageTreePoster } from './components/HeritageTreePoster';
import { StatsDrawer } from './components/StatsDrawer';
import { PersonModal } from './components/PersonModal';
import { BulkAddModal } from './components/BulkAddModal';
import { NewTreeModal } from './components/NewTreeModal';
import { FamilyTree, Person, AppTab } from './types/family';
import { loadCurrentTree, saveCurrentTree, resetToSampleTree } from './utils/storage';
import { getBranchColorByIndex } from './utils/initialData';

export default function App() {
  const [tree, setTree] = useState<FamilyTree>(loadCurrentTree);
  const [currentTab, setCurrentTab] = useState<AppTab>('list');

  // Modal states
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [personModalMode, setPersonModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [parentForNewChild, setParentForNewChild] = useState<Person | null>(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkParent, setBulkParent] = useState<Person | null>(null);

  const [newTreeModalOpen, setNewTreeModalOpen] = useState(false);

  // Auto-save whenever tree changes
  useEffect(() => {
    saveCurrentTree(tree);
  }, [tree]);

  // Total members count
  const totalMembers = Object.keys(tree.members).length;

  // Handler: Add Child
  const handleOpenAddChild = (parent: Person) => {
    setParentForNewChild(parent);
    setSelectedPerson(null);
    setPersonModalMode('add');
    setPersonModalOpen(true);
  };

  // Handler: Open Edit Person
  const handleOpenEditPerson = (person: Person) => {
    setSelectedPerson(person);
    setParentForNewChild(person.parentId ? tree.members[person.parentId] || null : null);
    setPersonModalMode('edit');
    setPersonModalOpen(true);
  };

  // Save Person (Add or Edit)
  const handleSavePerson = (personData: Partial<Person>) => {
    if (personModalMode === 'add' && parentForNewChild) {
      const newId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const isDirectChildOfRoot = parentForNewChild.id === tree.rootId;
      const childCount = parentForNewChild.childrenIds.length;

      // Assign branch color
      const assignedBranchColor =
        personData.branchColor ||
        (isDirectChildOfRoot
          ? getBranchColorByIndex(childCount).hex
          : parentForNewChild.branchColor || '#059669');

      const newPerson: Person = {
        id: newId,
        name: personData.name || 'عضو جديد',
        title: personData.title,
        gender: personData.gender || 'male',
        parentId: parentForNewChild.id,
        spouse: personData.spouse,
        childrenIds: [],
        birthYear: personData.birthYear,
        notes: personData.notes,
        isDeceased: personData.isDeceased,
        branchColor: assignedBranchColor,
      };

      setTree((prev) => {
        const updatedParent = {
          ...parentForNewChild,
          childrenIds: [...parentForNewChild.childrenIds, newId],
        };
        return {
          ...prev,
          members: {
            ...prev.members,
            [parentForNewChild.id]: updatedParent,
            [newId]: newPerson,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    } else if (personModalMode === 'edit' && selectedPerson) {
      setTree((prev) => {
        const updated = {
          ...selectedPerson,
          ...personData,
        };
        return {
          ...prev,
          members: {
            ...prev.members,
            [selectedPerson.id]: updated,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    }
  };

  // Handler: Bulk Add Children
  const handleOpenBulkAdd = (parent: Person) => {
    setBulkParent(parent);
    setBulkModalOpen(true);
  };

  const handleBulkAddExecute = (names: string[]) => {
    if (!bulkParent) return;

    setTree((prev) => {
      const isDirectChildOfRoot = bulkParent.id === prev.rootId;
      let currentChildCount = bulkParent.childrenIds.length;
      const newChildrenIds: string[] = [];
      const newMembers = { ...prev.members };

      names.forEach((rawName) => {
        const id = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        newChildrenIds.push(id);

        const assignedColor = isDirectChildOfRoot
          ? getBranchColorByIndex(currentChildCount).hex
          : bulkParent.branchColor || '#059669';

        currentChildCount++;

        newMembers[id] = {
          id,
          name: rawName,
          gender: 'male',
          parentId: bulkParent.id,
          childrenIds: [],
          branchColor: assignedColor,
        };
      });

      newMembers[bulkParent.id] = {
        ...bulkParent,
        childrenIds: [...bulkParent.childrenIds, ...newChildrenIds],
      };

      return {
        ...prev,
        members: newMembers,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Handler: Delete Person (Recursive cascading delete)
  const handleDeletePerson = (personId: string) => {
    if (personId === tree.rootId) {
      alert('لا يمكن حذف الجد الرئيسي المؤسس للشجرة');
      return;
    }

    setTree((prev) => {
      const personToDelete = prev.members[personId];
      if (!personToDelete) return prev;

      // Collect all descendants
      const idsToDelete = new Set<string>();
      const collectDescendants = (id: string) => {
        idsToDelete.add(id);
        const p = prev.members[id];
        if (p) {
          p.childrenIds.forEach((cid) => collectDescendants(cid));
        }
      };
      collectDescendants(personId);

      const newMembers = { ...prev.members };
      idsToDelete.forEach((id) => {
        delete newMembers[id];
      });

      // Remove from parent's children list
      if (personToDelete.parentId && newMembers[personToDelete.parentId]) {
        const parent = newMembers[personToDelete.parentId];
        newMembers[parent.id] = {
          ...parent,
          childrenIds: parent.childrenIds.filter((cid) => cid !== personId),
        };
      }

      return {
        ...prev,
        members: newMembers,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Title & Subtitle change
  const handleTitleChange = (title: string, subtitle?: string) => {
    setTree((prev) => ({
      ...prev,
      title,
      subtitle,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Reset to Sample Tree
  const handleResetSample = () => {
    if (confirm('هل ترغب في استرجاع النموذج التجريبي لشجرة العائلة؟')) {
      const sample = resetToSampleTree();
      setTree(sample);
    }
  };

  // Create new Tree from scratch
  const handleCreateNewTree = (newTree: FamilyTree) => {
    setTree(newTree);
    setCurrentTab('list');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col">
      {/* Top Header */}
      <Header
        tree={tree}
        totalMembers={totalMembers}
        onNewTree={() => setNewTreeModalOpen(true)}
        onResetSample={handleResetSample}
        onExportPosterTab={() => setCurrentTab('poster')}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'list' && (
          <TreeViewEditor
            tree={tree}
            onUpdateTree={setTree}
            onAddChild={handleOpenAddChild}
            onBulkAddChildren={handleOpenBulkAdd}
            onEditPerson={handleOpenEditPerson}
            onDeletePerson={handleDeletePerson}
            onTitleChange={handleTitleChange}
          />
        )}

        {currentTab === 'diagram' && (
          <InteractiveTreeCanvas
            tree={tree}
            onSelectPerson={handleOpenEditPerson}
            onAddChild={handleOpenAddChild}
          />
        )}

        {currentTab === 'poster' && <HeritageTreePoster tree={tree} />}

        {currentTab === 'stats' && (
          <StatsDrawer
            tree={tree}
            onSelectPerson={handleOpenEditPerson}
            onImportTree={setTree}
            onNewTree={() => setNewTreeModalOpen(true)}
            onResetSample={handleResetSample}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (Mobile thumb zone) */}
      <BottomNav currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* Person Add / Edit Modal */}
      <PersonModal
        isOpen={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        onSave={handleSavePerson}
        person={selectedPerson}
        parentPerson={parentForNewChild}
        mode={personModalMode}
        isRootLevel={Boolean(parentForNewChild && parentForNewChild.id === tree.rootId)}
      />

      {/* Bulk Add Children Modal */}
      {bulkParent && (
        <BulkAddModal
          isOpen={bulkModalOpen}
          onClose={() => {
            setBulkModalOpen(false);
            setBulkParent(null);
          }}
          onBulkAdd={handleBulkAddExecute}
          parentPerson={bulkParent}
        />
      )}

      {/* New Tree Modal */}
      <NewTreeModal
        isOpen={newTreeModalOpen}
        onClose={() => setNewTreeModalOpen(false)}
        onCreateTree={handleCreateNewTree}
      />
    </div>
  );
}
