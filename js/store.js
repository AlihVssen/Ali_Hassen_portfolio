/**
 * Store & Persistence Manager for Ali Hassen Portfolio
 * Supports Supabase Cloud Sync with localStorage Fallback & Cache
 */

const SUPABASE_CONFIG = {
  url: 'https://xxthdnobrcanijtskcef.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dGhkbm9icmNhbmlqdHNrY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMDEwNjAsImV4cCI6MjEwMjU3NzA2MH0.CL41loOOXJcyPXoSeATr6GAKehL47u04iZ5ThSeFm2E'
};

class PortfolioStore {
  constructor() {
    this.STORAGE_KEY = 'ali_hassen_portfolio_data_v2';
    this.PIN_KEY = 'ali_hassen_admin_pin';
    this.listeners = [];
    this.supabaseClient = null;
    this.isCloudSyncing = false;
    this.data = this.loadLocalCache();
    
    // Default PIN: 2026 if not set
    if (!localStorage.getItem(this.PIN_KEY)) {
      localStorage.setItem(this.PIN_KEY, '2026');
    }

    this.initSupabase();
  }

  initSupabase() {
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        this.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.fetchCloudData();
      } else {
        console.warn("Supabase library not ready or loaded. Operating in offline cache mode.");
      }
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
    }
  }

  loadLocalCache() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          profile: { ...DEFAULT_DATA.profile, ...(parsed.profile || {}) },
          aiPhilosophy: { ...DEFAULT_DATA.aiPhilosophy, ...(parsed.aiPhilosophy || {}) }
        };
      }
    } catch (e) {
      console.warn("Could not parse cached portfolio data. Using seed defaults.", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  async fetchCloudData() {
    if (!this.supabaseClient) return;
    try {
      const { data, error } = await this.supabaseClient
        .from('portfolio_state')
        .select('data, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (error) {
        console.warn("Cloud sync query notice:", error.message);
        return;
      }

      if (data && data.data) {
        // Update local memory and cache with live cloud data
        this.data = {
          ...DEFAULT_DATA,
          ...data.data,
          profile: { ...DEFAULT_DATA.profile, ...(data.data.profile || {}) },
          aiPhilosophy: { ...DEFAULT_DATA.aiPhilosophy, ...(data.data.aiPhilosophy || {}) }
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        this.notify();
        console.log("⚡ Successfully synchronized live portfolio data from Supabase cloud.");
      } else {
        // If row doesn't exist yet, seed the cloud with our initial data
        console.log("No cloud data found yet. Seeding default data to Supabase...");
        await this.syncToCloud(this.data);
      }
    } catch (e) {
      console.warn("Network or cloud fetch issue:", e);
    }
  }

  async syncToCloud(payload) {
    if (!this.supabaseClient) return;
    try {
      this.isCloudSyncing = true;
      const { error } = await this.supabaseClient
        .from('portfolio_state')
        .upsert({
          id: 'main',
          data: payload,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Supabase upsert error:", error.message);
      } else {
        console.log("✅ Data successfully saved to Supabase cloud database.");
      }
    } catch (err) {
      console.error("Failed to sync to Supabase:", err);
    } finally {
      this.isCloudSyncing = false;
    }
  }

  save() {
    try {
      // 1. Save locally for instant UI response & offline support
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      this.notify();

      // 2. Sync to Supabase cloud
      this.syncToCloud(this.data);
    } catch (e) {
      console.error("Failed to save data:", e);
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
    if (category === "All") return;
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
