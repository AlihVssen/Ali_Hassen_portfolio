/**
 * Admin Dashboard Controller for Ali Hassen Portfolio
 * Allows dynamic management of Projects, Categories, Skills, Experience, and Bio
 */

class DashboardController {
  constructor() {
    this.isOpen = false;
    this.isAuthenticated = false;
    this.activeTab = 'projects';
    this.editingProjectId = null;

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Open Dashboard Button
    const openBtn = document.getElementById('open-dashboard-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }

    // Close Dashboard Button
    const closeBtn = document.getElementById('close-dashboard-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // PIN Authentication Form
    const pinForm = document.getElementById('admin-pin-form');
    if (pinForm) {
      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pinInput = document.getElementById('admin-pin-input');
        const isValid = pinInput ? await store.verifyPIN(pinInput.value.trim()) : false;
        if (isValid) {
          this.isAuthenticated = true;
          this.renderAuthenticatedView();
        } else {
          const pinError = document.getElementById('pin-error-msg');
          if (pinError) {
            pinError.textContent = 'Incorrect PIN.';
            pinError.style.display = 'block';
          }
        }
      });
    }

    // Dashboard Navigation Tabs
    const tabButtons = document.querySelectorAll('.dash-nav-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Project Form Submission
    const projForm = document.getElementById('project-edit-form');
    if (projForm) {
      projForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveProject();
      });
    }

    // Cancel Project Edit
    const cancelProjBtn = document.getElementById('cancel-project-edit-btn');
    if (cancelProjBtn) {
      cancelProjBtn.addEventListener('click', () => {
        this.resetProjectForm();
      });
    }

    // Add New Project Button
    const newProjBtn = document.getElementById('add-new-project-btn');
    if (newProjBtn) {
      newProjBtn.addEventListener('click', () => {
        this.resetProjectForm();
        document.getElementById('project-form-container').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Add Category Form
    const addCatForm = document.getElementById('add-category-form');
    if (addCatForm) {
      addCatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('new-category-input');
        if (input && input.value.trim()) {
          store.addCategory(input.value.trim());
          input.value = '';
          this.renderCategoriesManager();
          this.populateProjectCategorySelect();
        }
      });
    }

    // Profile Form
    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveProfile();
      });
    }

    // Backup & Restore actions
    const exportBtn = document.getElementById('export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    const importFile = document.getElementById('import-json-file');
    if (importFile) {
      importFile.addEventListener('change', (e) => this.importData(e));
    }

    const resetBtn = document.getElementById('reset-defaults-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all portfolio data to the verified defaults? Custom additions will be replaced.")) {
          store.resetToDefaults();
          this.renderAuthenticatedView();
          alert("Reset to defaults successful.");
        }
      });
    }

    // Change PIN
    const changePinForm = document.getElementById('change-pin-form');
    if (changePinForm) {
      changePinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPinInput = document.getElementById('new-pin-input');
        if (newPinInput && newPinInput.value.length >= 4) {
          await store.setPIN(newPinInput.value);
          alert("PIN successfully changed and securely hashed.");
          newPinInput.value = '';
        } else {
          alert("PIN must be at least 4 characters/digits.");
        }
      });
    }
  }

  open() {
    const drawer = document.getElementById('admin-dashboard-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) {
      drawer.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';

      if (backdrop) {
        backdrop.classList.add('active');
        // Close drawer when clicking outside
        backdrop.onclick = () => this.close();
      }

      if (this.isAuthenticated) {
        this.renderAuthenticatedView();
      } else {
        const pinInput = document.getElementById('admin-pin-input');
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
      }
    }
  }

  close() {
    const drawer = document.getElementById('admin-dashboard-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) {
      drawer.classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = '';
    }
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.onclick = null;
    }
  }

  renderAuthenticatedView() {
    const authSection = document.getElementById('dash-auth-section');
    const mainSection = document.getElementById('dash-main-section');
    if (authSection) authSection.style.display = 'none';
    if (mainSection) mainSection.style.display = 'block';

    this.switchTab(this.activeTab);
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.dash-nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    document.querySelectorAll('.dash-tab-pane').forEach(pane => {
      pane.style.display = pane.id === `tab-${tabName}` ? 'block' : 'none';
    });

    switch (tabName) {
      case 'projects':
        this.renderProjectsManager();
        break;
      case 'skills':
        this.renderSkillsManager();
        break;
      case 'experience':
        this.renderExperienceManager();
        break;
      case 'profile':
        this.populateProfileForm();
        break;
      case 'categories':
        this.renderCategoriesManager();
        break;
      case 'backup':
        // Ready
        break;
    }
  }

  renderProjectsManager() {
    const listEl = document.getElementById('dash-projects-list');
    if (!listEl) return;

    const projects = store.getProjects();
    this.populateProjectCategorySelect();

    if (projects.length === 0) {
      listEl.innerHTML = `<p class="dash-empty-notice">No projects configured. Use the form below to create your first project.</p>`;
      return;
    }

    listEl.innerHTML = projects.map(proj => `
      <div class="dash-item-card">
        <div class="dash-item-info">
          <div class="dash-item-meta">
            <span class="dash-badge">${this.escapeHtml(proj.category)}</span>
            ${proj.type ? `<span class="dash-badge sub">${this.escapeHtml(proj.type)}</span>` : ''}
            ${proj.featured ? `<span class="dash-badge gold">Featured</span>` : ''}
          </div>
          <h4 class="dash-item-title">${this.escapeHtml(proj.name)}</h4>
          <p class="dash-item-sub">${this.escapeHtml(proj.summary || proj.whatWasBuilt || '')}</p>
        </div>
        <div class="dash-item-actions">
          <button class="btn btn-sm btn-outline edit-proj-btn" data-id="${proj.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-proj-btn" data-id="${proj.id}">Delete</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.edit-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.loadProjectIntoForm(id);
      });
    });

    listEl.querySelectorAll('.delete-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm("Are you sure you want to delete this project?")) {
          store.deleteProject(id);
          this.renderProjectsManager();
        }
      });
    });
  }

  populateProjectCategorySelect() {
    const select = document.getElementById('project-category-select');
    if (!select) return;

    const categories = store.getCategories().filter(c => c !== 'All');
    select.innerHTML = categories.map(cat => `
      <option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>
    `).join('');
  }

  loadProjectIntoForm(id) {
    const proj = store.getProject(id);
    if (!proj) return;

    this.editingProjectId = id;
    document.getElementById('project-form-title').textContent = `Edit Project: ${proj.name}`;
    document.getElementById('proj-name-input').value = proj.name || '';
    document.getElementById('project-category-select').value = proj.category || 'Websites';
    document.getElementById('proj-type-input').value = proj.type || '';
    document.getElementById('proj-featured-input').checked = !!proj.featured;
    document.getElementById('proj-summary-input').value = proj.summary || '';
    document.getElementById('proj-tech-input').value = (proj.technologies || []).join(', ');
    document.getElementById('proj-weburl-input').value = proj.websiteUrl || '';
    document.getElementById('proj-github-input').value = proj.githubUrl || '';
    document.getElementById('proj-screenshot-input').value = proj.screenshot || '';
    document.getElementById('proj-gallery-input').value = (proj.gallery || []).join('\n');
    document.getElementById('proj-client-input').value = proj.client || '';
    document.getElementById('proj-date-input').value = proj.date || '';
    document.getElementById('proj-what-input').value = proj.whatWasBuilt || '';
    document.getElementById('proj-objective-input').value = proj.objective || '';
    document.getElementById('proj-design-input').value = proj.designApproach || '';
    document.getElementById('proj-dev-input').value = proj.developmentApproach || '';
    document.getElementById('proj-features-input').value = Array.isArray(proj.features) ? proj.features.join('\n') : (proj.features || '');
    document.getElementById('proj-result-input').value = proj.result || '';

    document.getElementById('project-form-container').scrollIntoView({ behavior: 'smooth' });
  }

  resetProjectForm() {
    this.editingProjectId = null;
    document.getElementById('project-form-title').textContent = 'Add New Project';
    document.getElementById('project-edit-form').reset();
  }

  handleSaveProject() {
    const name = document.getElementById('proj-name-input').value.trim();
    if (!name) {
      alert("Project Name is required.");
      return;
    }

    const techInput = document.getElementById('proj-tech-input').value;
    const technologies = techInput.split(',').map(t => t.trim()).filter(t => t);

    const galleryInput = document.getElementById('proj-gallery-input').value;
    const gallery = galleryInput.split('\n').map(g => g.trim()).filter(g => g);

    const featuresInput = document.getElementById('proj-features-input').value;
    const features = featuresInput.split('\n').map(f => f.trim()).filter(f => f);

    const projectData = {
      id: this.editingProjectId || undefined,
      name: name,
      category: document.getElementById('project-category-select').value,
      type: document.getElementById('proj-type-input').value.trim(),
      featured: document.getElementById('proj-featured-input').checked,
      summary: document.getElementById('proj-summary-input').value.trim(),
      technologies: technologies,
      websiteUrl: document.getElementById('proj-weburl-input').value.trim(),
      githubUrl: document.getElementById('proj-github-input').value.trim(),
      screenshot: document.getElementById('proj-screenshot-input').value.trim(),
      gallery: gallery,
      client: document.getElementById('proj-client-input').value.trim(),
      date: document.getElementById('proj-date-input').value.trim(),
      whatWasBuilt: document.getElementById('proj-what-input').value.trim(),
      objective: document.getElementById('proj-objective-input').value.trim(),
      designApproach: document.getElementById('proj-design-input').value.trim(),
      developmentApproach: document.getElementById('proj-dev-input').value.trim(),
      features: features,
      result: document.getElementById('proj-result-input').value.trim()
    };

    store.saveProject(projectData);
    this.resetProjectForm();
    this.renderProjectsManager();
    alert("Project saved successfully!");
  }

  renderSkillsManager() {
    const container = document.getElementById('dash-skills-editor');
    if (!container) return;

    const skillCategories = store.getSkillCategories();

    container.innerHTML = skillCategories.map(cat => `
      <div class="dash-skill-category-box" data-cat-id="${cat.id}">
        <div class="dash-box-header">
          <h4>${this.escapeHtml(cat.name)}</h4>
        </div>
        <div class="dash-skill-pills-list">
          ${(cat.skills || []).map(skill => `
            <span class="dash-skill-item">
              <span>${this.escapeHtml(skill)}</span>
              <button type="button" class="remove-skill-btn" data-cat="${cat.id}" data-skill="${this.escapeHtml(skill)}">&times;</button>
            </span>
          `).join('')}
        </div>
        <div class="dash-add-skill-row">
          <input type="text" placeholder="Add verified skill..." class="dash-input add-skill-input" data-cat="${cat.id}" />
          <button type="button" class="btn btn-sm btn-primary add-skill-btn" data-cat="${cat.id}">+ Add</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.remove-skill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const catId = e.currentTarget.dataset.cat;
        const skill = e.currentTarget.dataset.skill;
        store.removeSkill(catId, skill);
        this.renderSkillsManager();
      });
    });

    container.querySelectorAll('.add-skill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const catId = e.currentTarget.dataset.cat;
        const input = container.querySelector(`.add-skill-input[data-cat="${catId}"]`);
        if (input && input.value.trim()) {
          store.addSkill(catId, input.value.trim());
          input.value = '';
          this.renderSkillsManager();
        }
      });
    });
  }

  renderCategoriesManager() {
    const listEl = document.getElementById('dash-categories-list');
    if (!listEl) return;

    const categories = store.getCategories();

    listEl.innerHTML = categories.map(cat => `
      <div class="dash-category-row">
        <span>${this.escapeHtml(cat)}</span>
        ${cat !== 'All' ? `
          <button class="btn btn-sm btn-danger delete-cat-btn" data-cat="${this.escapeHtml(cat)}">Remove</button>
        ` : `<span class="dash-badge sub">System Default</span>`}
      </div>
    `).join('');

    listEl.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.cat;
        if (confirm(`Remove category "${cat}"?`)) {
          store.removeCategory(cat);
          this.renderCategoriesManager();
        }
      });
    });
  }

  renderExperienceManager() {
    const container = document.getElementById('dash-experience-editor');
    if (!container) return;

    const exps = store.getData().experience || [];

    container.innerHTML = exps.map((exp, idx) => `
      <div class="dash-card-nested" data-exp-idx="${idx}">
        <div class="dash-input-group">
          <label>Company / Organization</label>
          <input type="text" class="dash-input exp-company" value="${this.escapeHtml(exp.company)}" />
        </div>
        <div class="dash-input-group">
          <label>Role</label>
          <input type="text" class="dash-input exp-role" value="${this.escapeHtml(exp.role)}" />
        </div>
        <div class="dash-input-group">
          <label>Status / Display Date (e.g. Ended — August 2026)</label>
          <input type="text" class="dash-input exp-status" value="${this.escapeHtml(exp.status || '')}" />
        </div>
        <div class="dash-input-group">
          <label>Highlights / Key Responsibilities (One per line)</label>
          <textarea class="dash-textarea exp-highlights" rows="3">${(exp.highlights || []).join('\n')}</textarea>
        </div>
      </div>
    `).join('') + `
      <button type="button" id="save-experience-btn" class="btn btn-primary" style="margin-top: 1rem;">Save Experience Changes</button>
    `;

    const saveExpBtn = document.getElementById('save-experience-btn');
    if (saveExpBtn) {
      saveExpBtn.addEventListener('click', () => {
        const updatedExps = [];
        container.querySelectorAll('.dash-card-nested').forEach((box, index) => {
          const company = box.querySelector('.exp-company').value.trim();
          const role = box.querySelector('.exp-role').value.trim();
          const status = box.querySelector('.exp-status').value.trim();
          const highlightsRaw = box.querySelector('.exp-highlights').value;
          const highlights = highlightsRaw.split('\n').map(h => h.trim()).filter(h => h);

          updatedExps.push({
            id: exps[index] ? exps[index].id : `exp-${Date.now()}-${index}`,
            company,
            role,
            status,
            startDate: "", // No invented start date
            endDate: status.includes('August 2026') ? 'August 2026' : '',
            highlights
          });
        });

        store.updateExperience(updatedExps);
        alert("Experience updated successfully!");
      });
    }
  }

  populateProfileForm() {
    const p = store.getData().profile;
    document.getElementById('prof-name-input').value = p.name || '';
    document.getElementById('prof-headline-input').value = p.headline || '';
    document.getElementById('prof-secondary-input').value = p.secondaryTitle || '';
    document.getElementById('prof-tagline-input').value = p.tagline || '';
    document.getElementById('prof-location-input').value = p.location || '';
    document.getElementById('prof-status-input').value = p.status || '';
    document.getElementById('prof-avatar-input').value = p.avatar || '';
    document.getElementById('prof-bio-input').value = (p.bio || []).join('\n\n');
    document.getElementById('prof-email-input').value = p.email || '';
    document.getElementById('prof-github-input').value = p.github || '';
    document.getElementById('prof-linkedin-input').value = p.linkedin || '';

    // Update avatar preview
    const previewImg = document.getElementById('prof-avatar-preview-img');
    if (previewImg) {
      previewImg.src = p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    }

    // Avatar input change listener
    const avatarInput = document.getElementById('prof-avatar-input');
    if (avatarInput) {
      avatarInput.oninput = (e) => {
        if (previewImg && e.target.value) previewImg.src = e.target.value;
      };
    }

    // Avatar file upload listener (auto-resizes and optimizes photo for cloud database)
    const avatarFile = document.getElementById('prof-avatar-file');
    if (avatarFile) {
      avatarFile.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_SIZE = 500;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_SIZE) {
                  height *= MAX_SIZE / width;
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width *= MAX_SIZE / height;
                  height = MAX_SIZE;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
              avatarInput.value = optimizedBase64;
              if (previewImg) previewImg.src = optimizedBase64;
            };
            img.src = loadEvt.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }

  handleSaveProfile() {
    const bioRaw = document.getElementById('prof-bio-input').value;
    const bio = bioRaw.split('\n\n').map(b => b.trim()).filter(b => b);

    const profileData = {
      name: document.getElementById('prof-name-input').value.trim(),
      headline: document.getElementById('prof-headline-input').value.trim(),
      secondaryTitle: document.getElementById('prof-secondary-input').value.trim(),
      tagline: document.getElementById('prof-tagline-input').value.trim(),
      location: document.getElementById('prof-location-input').value.trim(),
      status: document.getElementById('prof-status-input').value.trim(),
      avatar: document.getElementById('prof-avatar-input').value.trim(),
      bio: bio,
      email: document.getElementById('prof-email-input').value.trim(),
      github: document.getElementById('prof-github-input').value.trim(),
      linkedin: document.getElementById('prof-linkedin-input').value.trim()
    };

    store.updateProfile(profileData);
    alert("Profile info & photo saved successfully!");
  }

  exportData() {
    const jsonStr = store.exportJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ali-hassen-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = store.importJSON(e.target.result);
      if (res.success) {
        alert("Portfolio data imported successfully!");
        this.renderAuthenticatedView();
      } else {
        alert("Import failed: " + res.error);
      }
    };
    reader.readAsText(file);
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Instantiate dashboard controller
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardApp = new DashboardController();
});
