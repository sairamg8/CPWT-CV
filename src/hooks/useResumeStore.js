import { useState, useEffect } from 'react';
import { defaultResumeData, dummyResumeData, defaultResumeDataExecutive, SECTION_TYPE_DEFAULTS, ATS_DEFAULTS } from '@/utils/defaultData';

const STORAGE_KEY = 'cpwtcv_v1';

function loadStore() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.resumes && parsed.activeId) return parsed;
    }
  } catch {}
  const now = Date.now();
  const sairam = { ...JSON.parse(JSON.stringify(defaultResumeData)), id: `resume_${now}`, updatedAt: now };
  const exec   = { ...JSON.parse(JSON.stringify(defaultResumeDataExecutive)), id: `resume_${now + 1}`, updatedAt: now };
  const maya   = { ...JSON.parse(JSON.stringify(dummyResumeData)), id: `resume_${now + 2}`, updatedAt: now };
  return { resumes: [sairam, exec, maya], activeId: sairam.id };
}

export function useAppStore() {
  const [appState, setAppState] = useState(loadStore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const activeResume = appState.resumes.find(r => r.id === appState.activeId) || appState.resumes[0];

  function setActiveId(id) {
    setAppState(prev => ({ ...prev, activeId: id }));
  }

  function patchActive(updater) {
    setAppState(prev => ({
      ...prev,
      resumes: prev.resumes.map(r =>
        r.id === prev.activeId ? { ...updater(r), updatedAt: Date.now() } : r
      ),
    }));
  }

  // Called by cloud sync after merging cloud + local on sign-in
  function loadResumes(resumes) {
    setAppState(prev => ({
      resumes,
      activeId: resumes.find(r => r.id === prev.activeId) ? prev.activeId : (resumes[0]?.id || prev.activeId),
    }));
  }

  // ── Resume management ──────────────────────────────────────────────

  function createResume(name = 'Untitled Resume') {
    const id = `resume_${Date.now()}`;
    const newResume = {
      ...JSON.parse(JSON.stringify(defaultResumeData)),
      id,
      name,
      updatedAt: Date.now(),
      settings: { ...ATS_DEFAULTS },
    };
    setAppState(prev => ({ resumes: [...prev.resumes, newResume], activeId: id }));
    return id;
  }

  function importResume(data) {
    const id = `resume_${Date.now()}`;
    const imported = {
      ...JSON.parse(JSON.stringify(data)),
      id,
      updatedAt: Date.now(),
    };
    setAppState(prev => ({ resumes: [...prev.resumes, imported], activeId: id }));
    return id;
  }

  function duplicateResume(id) {
    const source = appState.resumes.find(r => r.id === id);
    if (!source) return;
    const newId = `resume_${Date.now()}`;
    const copy = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: `${source.name} (Copy)`,
      updatedAt: Date.now(),
    };
    setAppState(prev => ({ resumes: [...prev.resumes, copy], activeId: newId }));
    return newId;
  }

  function deleteResume(id) {
    setAppState(prev => {
      const remaining = prev.resumes.filter(r => r.id !== id);
      if (!remaining.length) {
        const newResume = {
          ...JSON.parse(JSON.stringify(defaultResumeData)),
          id: `resume_${Date.now()}`,
          updatedAt: Date.now(),
        };
        return { resumes: [newResume], activeId: newResume.id };
      }
      return {
        resumes: remaining,
        activeId: prev.activeId === id ? remaining[0].id : prev.activeId,
      };
    });
  }

  function renameResume(id, name) {
    setAppState(prev => ({
      ...prev,
      resumes: prev.resumes.map(r => r.id === id ? { ...r, name, updatedAt: Date.now() } : r),
    }));
  }

  // ── Personal Info ──────────────────────────────────────────────────

  function updatePersonal(field, value) {
    patchActive(r => ({ ...r, personal: { ...r.personal, [field]: value } }));
  }

  function toggleFieldVisibility(field) {
    patchActive(r => {
      const hidden = r.personal.hiddenFields || [];
      return {
        ...r,
        personal: {
          ...r.personal,
          hiddenFields: hidden.includes(field)
            ? hidden.filter(f => f !== field)
            : [...hidden, field],
        },
      };
    });
  }

  // ── Settings & Template ────────────────────────────────────────────

  function updateSetting(key, value) {
    patchActive(r => ({ ...r, settings: { ...(r.settings || {}), [key]: value } }));
  }

  function resetSettings() {
    patchActive(r => ({ ...r, settings: { ...ATS_DEFAULTS } }));
  }

  const TEMPLATE_STYLE_DEFAULTS = {
    executive: { headingStyle: 'underline', sectionTitleCase: 'normal' },
    classic:   { headingStyle: 'ruled',     sectionTitleCase: 'upper'  },
    modern:    { headingStyle: 'line',      sectionTitleCase: 'upper'  },
    minimal:   { headingStyle: 'underline', sectionTitleCase: 'upper'  },
    sidebar:   { headingStyle: 'plain',     sectionTitleCase: 'upper'  },
  };

  function setTemplate(template) {
    const styleDefaults = TEMPLATE_STYLE_DEFAULTS[template] || {};
    patchActive(r => ({
      ...r,
      template,
      settings: { ...r.settings, ...styleDefaults },
    }));
  }

  // ── Sections ───────────────────────────────────────────────────────

  function updateSections(sections) {
    patchActive(r => ({ ...r, sections }));
  }

  function updateSection(sectionId, updater) {
    patchActive(r => ({
      ...r,
      sections: r.sections.map(s => s.id === sectionId ? updater(s) : s),
    }));
  }

  function updateSectionSettings(sectionId, key, value) {
    updateSection(sectionId, s => ({
      ...s,
      settings: { ...(s.settings || {}), [key]: value },
    }));
  }

  function addSection(type) {
    const id = `${type}_${Date.now()}`;
    const factory = SECTION_TYPE_DEFAULTS[type] || SECTION_TYPE_DEFAULTS.custom;
    patchActive(r => ({ ...r, sections: [...r.sections, factory(id)] }));
  }

  function removeSection(sectionId) {
    patchActive(r => ({ ...r, sections: r.sections.filter(s => s.id !== sectionId) }));
  }

  function toggleSectionVisibility(sectionId) {
    updateSection(sectionId, s => ({ ...s, visible: s.visible === false ? true : false }));
  }

  function addItem(sectionId, item) {
    updateSection(sectionId, s => ({ ...s, items: [...s.items, item] }));
  }

  function updateItem(sectionId, itemId, updater) {
    updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(i => i.id === itemId ? updater(i) : i),
    }));
  }

  function removeItem(sectionId, itemId) {
    updateSection(sectionId, s => ({
      ...s,
      items: s.items.filter(i => i.id !== itemId),
    }));
  }

  function reorderItems(sectionId, oldIndex, newIndex) {
    updateSection(sectionId, s => {
      const items = [...s.items];
      const [removed] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, removed);
      return { ...s, items };
    });
  }

  // ── Cover Letter ───────────────────────────────────────────────────

  function updateCoverLetter(field, value) {
    patchActive(r => ({
      ...r,
      coverLetter: { ...(r.coverLetter || {}), [field]: value },
    }));
  }

  return {
    appState,
    activeResume,
    setActiveId,
    loadResumes,
    createResume,
    duplicateResume,
    deleteResume,
    renameResume,
    importResume,
    updatePersonal,
    toggleFieldVisibility,
    updateSetting,
    setTemplate,
    updateSections,
    updateSection,
    updateSectionSettings,
    addSection,
    removeSection,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    updateCoverLetter,
    toggleSectionVisibility,
    resetSettings,
  };
}
