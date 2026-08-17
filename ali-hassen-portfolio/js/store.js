/**
 * Store & Local Persistence Manager for Ali Hassen Portfolio
 */

class PortfolioStore {
  constructor() {
    this.STORAGE_KEY = 'ali_hassen_portfolio_data_v2';
    this.PIN_KEY = 'ali_hassen_admin_pin';
    this.listeners = [];
    this.data = this.loadData();
    
    // Default PIN: 2026 if not set
    if (!localStorage.getItem(this.PIN_KEY)) {
      localStorage.setItem(this.PIN_KEY, '2026');
    }
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with DEFAULT_DATA structure in case new fields were added
        return {
          ...DEFAULT_DATA,
          ...parsed,
          profile: { ...DEFAULT_DATA.profile, ...(parsed.profile || {}) },
          aiPhilosophy: { ...DEFAULT_DATA.aiPhilosophy, ...(parsed.aiPhilosophy || {}) }
        };
      }
    } catch (e) {
      console.warn("Could not parse stored portfolio data. Using seed defaults.", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error("Failed to save data to localStorage", e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.data);
      } catch (err) {
        console.error("Error in store subscriber:", err);
      }
    });
  }

  getData() {
    return this.data;
  }

  // Profile methods
  updateProfile(profileData) {
    this.data.profile = { ...this.data.profile, ...profileData };
    this.save();
  }

  // AI Philosophy methods
  updatePhilosophy(philData) {
    this.data.aiPhilosophy = { ...this.data.aiPhilosophy, ...philData };
    this.save();
  }

  // Project methods
  getProjects() {
    return this.data.projects || [];
  }

  getProject(id) {
    return this.data.projects.find(p => p.id === id);
  }

  saveProject(project) {
    if (!this.data.projects) this.data.projects = [];
    
    if (project.id) {
      const idx = this.data.projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        this.data.projects[idx] = { ...this.data.projects[idx], ...project };
      } else {
        this.data.projects.push(project);
      }
    } else {
      project.id = 'proj-' + Date.now();
      this.data.projects.push(project);
    }
    this.save();
  }

  deleteProject(id) {
    this.data.projects = (this.data.projects || []).filter(p => p.id !== id);
    this.save();
  }

  // Categories methods
  getCategories() {
    return this.data.projectCategories || [];
  }

  addCategory(category) {
    const trimmed = category.trim();
    if (trimmed && !this.data.projectCategories.includes(trimmed)) {
      this.data.projectCategories.push(trimmed);
      this.save();
    }
  }

  removeCategory(category) {
    if (category === "All") return; // Cannot delete All
    this.data.projectCategories = this.data.projectCategories.filter(c => c !== category);
    this.save();
  }

  // Skill methods
  getSkillCategories() {
    return this.data.skillCategories || [];
  }

  updateSkills(categoryIndex, skillsArray) {
    if (this.data.skillCategories[categoryIndex]) {
      this.data.skillCategories[categoryIndex].skills = skillsArray;
      this.save();
    }
  }

  addSkill(categoryId, skillName) {
    const cat = this.data.skillCategories.find(c => c.id === categoryId);
    if (cat && skillName.trim() && !cat.skills.includes(skillName.trim())) {
      cat.skills.push(skillName.trim());
      this.save();
    }
  }

  removeSkill(categoryId, skillName) {
    const cat = this.data.skillCategories.find(c => c.id === categoryId);
    if (cat) {
      cat.skills = cat.skills.filter(s => s !== skillName);
      this.save();
    }
  }

  // Experience methods
  updateExperience(expArray) {
    this.data.experience = expArray;
    this.save();
  }

  // Education methods
  updateEducation(eduArray) {
    this.data.education = eduArray;
    this.save();
  }

  // Backup and Restore
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.profile && parsed.skillCategories) {
        this.data = parsed;
        this.save();
        return { success: true };
      } else {
        return { success: false, error: "Invalid backup data structure." };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
  }

  // Auth / PIN
  verifyPIN(inputPin) {
    const currentPin = localStorage.getItem(this.PIN_KEY) || '2026';
    return inputPin === currentPin;
  }

  setPIN(newPin) {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(this.PIN_KEY, newPin);
      return true;
    }
    return false;
  }
}

const store = new PortfolioStore();
