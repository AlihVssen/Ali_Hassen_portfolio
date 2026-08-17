/**
 * Public Portfolio UI Renderer & Interaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize portfolio
  const portfolioApp = new PortfolioApp();
  portfolioApp.init();
});

class PortfolioApp {
  constructor() {
    this.activeCategory = 'All';
    this.brandCube = null;
  }

  init() {
    this.bindEvents();
    this.renderAll();

    // Subscribe to store updates
    store.subscribe(() => {
      this.renderAll();
    });

    // Initialize 3D Cube
    const cubeEl = document.getElementById('brand-cube');
    if (cubeEl) {
      this.brandCube = new InteractiveBrandCube(cubeEl);
    }

    // Initialize observer for scroll animations
    this.initScrollReveal();
  }

  bindEvents() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('open');
      });

      // Close menu on link click
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.classList.remove('open');
        });
      });
    }

    // Case study modal close
    const modalCloseBtn = document.getElementById('close-modal-btn');
    const modalOverlay = document.getElementById('project-modal');
    if (modalCloseBtn && modalOverlay) {
      modalCloseBtn.addEventListener('click', () => this.closeModal());
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }

    // CV Download / Preview CTA
    const cvButtons = document.querySelectorAll('.action-download-cv');
    cvButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCVModal();
      });
    });

    // Contact Form submission simulation
    const contactForm = document.getElementById('portfolio-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending message...</span>';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.innerHTML = '<span>Message Sent Successfully! ✓</span>';
          submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          contactForm.reset();

          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
          }, 4000);
        }, 1000);
      });
    }
  }

  renderAll() {
    const data = store.getData();
    this.renderHero(data.profile);
    this.renderCategoryTabs(data.projectCategories);
    this.renderProjects(data.projects);
    this.renderPhilosophy(data.aiPhilosophy);
    this.renderAbout(data.profile);
    this.renderSkills(data.skillCategories);
    this.renderExperience(data.experience);
    this.renderEducation(data.education);
    this.renderContactInfo(data.profile);
  }

  renderHero(profile) {
    const badgeEl = document.getElementById('hero-badge-text');
    if (badgeEl) badgeEl.textContent = `WEB DEVELOPER / ${profile.location.toUpperCase()}`;

    const headlineEl = document.getElementById('hero-name');
    if (headlineEl) headlineEl.textContent = profile.name;

    const roleDescriptorEl = document.getElementById('hero-role-descriptor');
    if (roleDescriptorEl) roleDescriptorEl.textContent = profile.secondaryTitle || profile.headline;

    const taglineEl = document.getElementById('hero-tagline');
    if (taglineEl) taglineEl.textContent = profile.tagline;

    const statusBadgeEl = document.getElementById('hero-status-pill');
    if (statusBadgeEl) statusBadgeEl.innerHTML = `<span class="status-dot"></span> ${profile.status}`;

    // Render Mini Avatar in Hero & Navbar
    const avatarMiniImg = document.getElementById('hero-avatar-mini-img');
    const avatarMiniContainer = document.getElementById('hero-avatar-mini-container');
    if (avatarMiniImg && avatarMiniContainer) {
      if (profile.avatar) {
        avatarMiniImg.src = profile.avatar;
        avatarMiniContainer.style.display = 'flex';
      } else {
        avatarMiniContainer.style.display = 'none';
      }
    }

    const navBrandWrap = document.getElementById('nav-brand-avatar-wrap');
    if (navBrandWrap) {
      if (profile.avatar) {
        navBrandWrap.innerHTML = `<img src="${this.escapeHtml(profile.avatar)}" alt="${this.escapeHtml(profile.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
      } else {
        navBrandWrap.innerHTML = `<span id="nav-brand-initials">AH</span>`;
      }
    }
  }

  renderCategoryTabs(categories) {
    const container = document.getElementById('project-filter-tabs');
    if (!container) return;

    // Ensure active category is valid
    if (!categories.includes(this.activeCategory)) {
      this.activeCategory = 'All';
    }

    container.innerHTML = categories.map(cat => `
      <button class="filter-tab-btn ${this.activeCategory === cat ? 'active' : ''}" data-category="${this.escapeHtml(cat)}">
        ${this.escapeHtml(cat)}
      </button>
    `).join('');

    container.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeCategory = e.currentTarget.dataset.category;
        container.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderProjects(store.getProjects());
      });
    });
  }

  renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    let filtered = projects;
    if (this.activeCategory !== 'All') {
      filtered = projects.filter(p => p.category === this.activeCategory);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-projects-state">
          <div class="empty-icon">📁</div>
          <h3>No projects found in "${this.escapeHtml(this.activeCategory)}"</h3>
          <p>You can add or assign projects to this category via the dashboard.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((proj, idx) => {
      const techTags = (proj.technologies || []).slice(0, 3).map(t => 
        `<span class="tech-badge">${this.escapeHtml(t)}</span>`
      ).join('');

      const remainingCount = (proj.technologies || []).length > 3 ? 
        `<span class="tech-badge more">+${proj.technologies.length - 3}</span>` : '';

      const imageSrc = proj.screenshot || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
      const directionClass = idx % 2 === 0 ? 'reveal-left' : 'reveal-right';
      const staggerClass = `stagger-${(idx % 4) + 1}`;
      return `
        <article class="project-card ${proj.featured ? 'featured' : ''} ${directionClass} ${staggerClass}" data-id="${proj.id}">
          <div class="project-media-wrapper">
            <img src="${this.escapeHtml(imageSrc)}" alt="${this.escapeHtml(proj.name)}" class="project-thumb" loading="lazy" />
            <div class="project-overlay">
              <button class="view-case-study-btn" data-id="${proj.id}">
                <span>View Case Study</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <span class="project-cat-tag">${this.escapeHtml(proj.category)}</span>
          </div>
          
          <div class="project-info">
            <div class="project-type-row">
              <span class="project-type-label">${this.escapeHtml(proj.type || 'Web Experience')}</span>
              ${proj.date ? `<span class="project-date">${this.escapeHtml(proj.date)}</span>` : ''}
            </div>
            
            <h3 class="project-title">${this.escapeHtml(proj.name)}</h3>
            <p class="project-desc">${this.escapeHtml(proj.summary || proj.whatWasBuilt || '')}</p>
            
            <div class="project-tech-stack">
              ${techTags}
              ${remainingCount}
            </div>

            <div class="project-actions-row">
              <button class="card-text-btn open-case-study" data-id="${proj.id}">
                Read Case Study →
              </button>
              ${proj.websiteUrl ? `
                <a href="${this.escapeHtml(proj.websiteUrl)}" target="_blank" rel="noopener noreferrer" class="card-icon-btn" title="Live Preview">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Register new elements with observer after browser layout
    requestAnimationFrame(() => this.refreshScrollReveal());

    // Attach click listeners to open case study modal
    grid.querySelectorAll('.view-case-study-btn, .open-case-study').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.openCaseStudy(id);
      });
    });
  }

  openCaseStudy(projectId) {
    const proj = store.getProject(projectId);
    if (!proj) return;

    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-case-study-body');
    if (!modal || !modalBody) return;

    // Helper to generate non-empty sections only
    let sectionsHtml = '';

    // Header metadata
    const techPills = (proj.technologies && proj.technologies.length > 0)
      ? `<div class="case-study-tech-wrap">
          <h4>Technologies & Tools</h4>
          <div class="case-study-pills">
            ${proj.technologies.map(t => `<span class="pill">${this.escapeHtml(t)}</span>`).join('')}
          </div>
        </div>`
      : '';

    // What was built
    if (proj.whatWasBuilt) {
      sectionsHtml += `
        <div class="case-study-block">
          <h4 class="block-title">What Was Built</h4>
          <p>${this.escapeHtml(proj.whatWasBuilt)}</p>
        </div>
      `;
    }

    // Objective
    if (proj.objective) {
      sectionsHtml += `
        <div class="case-study-block">
          <h4 class="block-title">Objective & Strategy</h4>
          <p>${this.escapeHtml(proj.objective)}</p>
        </div>
      `;
    }

    // Approaches in 2-column if both exist
    if (proj.designApproach || proj.developmentApproach) {
      sectionsHtml += `
        <div class="case-study-grid-2">
          ${proj.designApproach ? `
            <div class="case-study-card">
              <h4 class="card-title">🎨 Design & Visual Approach</h4>
              <p>${this.escapeHtml(proj.designApproach)}</p>
            </div>
          ` : ''}
          ${proj.developmentApproach ? `
            <div class="case-study-card">
              <h4 class="card-title">⚡ Development & AI Workflow</h4>
              <p>${this.escapeHtml(proj.developmentApproach)}</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Key Features list
    if (proj.features && proj.features.length > 0) {
      const featureItems = Array.isArray(proj.features) ? proj.features : proj.features.split('\n');
      sectionsHtml += `
        <div class="case-study-block">
          <h4 class="block-title">Key Features & Highlights</h4>
          <ul class="features-checklist">
            ${featureItems.filter(f => f.trim()).map(f => `<li><span class="check-icon">✓</span> ${this.escapeHtml(f.trim())}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Result
    if (proj.result) {
      sectionsHtml += `
        <div class="case-study-highlight-box">
          <h4>🚀 Result & Impact</h4>
          <p>${this.escapeHtml(proj.result)}</p>
        </div>
      `;
    }

    // Gallery images if available
    let galleryHtml = '';
    if (proj.gallery && proj.gallery.length > 0) {
      galleryHtml = `
        <div class="case-study-gallery">
          ${proj.gallery.map(img => `
            <img src="${this.escapeHtml(img)}" alt="Project screenshot preview" class="gallery-preview-img" loading="lazy" />
          `).join('')}
        </div>
      `;
    }

    modalBody.innerHTML = `
      <div class="case-study-header">
        <div class="cs-badge-row">
          <span class="cs-category-badge">${this.escapeHtml(proj.category)}</span>
          ${proj.type ? `<span class="cs-type-badge">${this.escapeHtml(proj.type)}</span>` : ''}
          ${proj.date ? `<span class="cs-date-badge">${this.escapeHtml(proj.date)}</span>` : ''}
          ${proj.client ? `<span class="cs-client-badge">Client: ${this.escapeHtml(proj.client)}</span>` : ''}
        </div>
        <h2 class="case-study-title">${this.escapeHtml(proj.name)}</h2>
        ${proj.summary ? `<p class="case-study-lead">${this.escapeHtml(proj.summary)}</p>` : ''}
        
        <div class="case-study-links-bar">
          ${proj.websiteUrl ? `
            <a href="${this.escapeHtml(proj.websiteUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>Visit Live Website</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          ` : ''}
          ${proj.githubUrl ? `
            <a href="${this.escapeHtml(proj.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <span>View GitHub</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </a>
          ` : ''}
        </div>
      </div>

      ${proj.screenshot ? `
        <div class="case-study-hero-image">
          <img src="${this.escapeHtml(proj.screenshot)}" alt="${this.escapeHtml(proj.name)}" />
        </div>
      ` : ''}

      ${techPills}
      
      <div class="case-study-content-flow">
        ${sectionsHtml}
        ${galleryHtml}
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderPhilosophy(philosophy) {
    const taglineEl = document.getElementById('ai-tagline');
    if (taglineEl) taglineEl.textContent = philosophy.tagline;

    const descEl = document.getElementById('ai-desc');
    if (descEl) descEl.textContent = philosophy.description;

    const grid = document.getElementById('ai-pillars-grid');
    if (!grid) return;

    grid.innerHTML = (philosophy.pillars || []).map((p, idx) => {
      const staggerClass = `stagger-${(idx % 4) + 1}`;
      const directionClass = idx % 2 === 0 ? 'reveal-left' : 'reveal-right';
      return `
        <div class="pillar-card ${directionClass} ${staggerClass}">
          <div class="pillar-icon">${p.icon}</div>
          <h4 class="pillar-title">${this.escapeHtml(p.title)}</h4>
          <p class="pillar-desc">${this.escapeHtml(p.desc)}</p>
        </div>
      `;
    }).join('');
    requestAnimationFrame(() => this.refreshScrollReveal());
  }

  renderAbout(profile) {
    const container = document.getElementById('about-bio-paragraphs');
    if (container) {
      container.innerHTML = (profile.bio || []).map(p => `
        <p class="about-p">${this.escapeHtml(p)}</p>
      `).join('');
    }

    const devPhoto = document.getElementById('about-dev-photo');
    if (devPhoto && profile.avatar) {
      devPhoto.src = profile.avatar;
    }
  }

  renderSkills(skillCategories) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    container.innerHTML = skillCategories.map((cat, idx) => {
      const isPrimary = cat.id === 'primary';
      const directionClass = idx % 2 === 0 ? 'reveal-left' : 'reveal-right';
      const staggerClass = `stagger-${idx + 1}`;

      const pills = (cat.skills || []).map(s => `
        <div class="skill-tag ${isPrimary ? 'primary-skill' : ''}">
          <span class="skill-indicator"></span>
          <span class="skill-name">${this.escapeHtml(s)}</span>
        </div>
      `).join('');

      return `
        <div class="skill-category-card ${isPrimary ? 'featured-category' : ''} ${directionClass} ${staggerClass}">
          <div class="category-header">
            <h3 class="category-title">${this.escapeHtml(cat.name)}</h3>
            ${isPrimary ? '<span class="focus-badge">Core Focus</span>' : ''}
          </div>
          <div class="skills-wrap">
            ${pills}
          </div>
        </div>
      `;
    }).join('');
    requestAnimationFrame(() => this.refreshScrollReveal());
  }

  renderExperience(experiences) {
    const container = document.getElementById('experience-timeline');
    if (!container) return;

    container.innerHTML = experiences.map((exp, idx) => {
      const highlightsHtml = (exp.highlights || []).map(h => `
        <li>${this.escapeHtml(h)}</li>
      `).join('');
      const directionClass = idx % 2 === 0 ? 'reveal-left' : 'reveal-right';
      const staggerClass = `stagger-${idx + 1}`;
      return `
        <div class="timeline-item ${directionClass} ${staggerClass}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="role-title">${this.escapeHtml(exp.role)}</h3>
              <span class="status-tag">${this.escapeHtml(exp.status || exp.endDate || '')}</span>
            </div>
            <h4 class="company-name">${this.escapeHtml(exp.company)}</h4>
            ${exp.highlights && exp.highlights.length > 0 ? `
              <ul class="experience-bullets">
                ${highlightsHtml}
              </ul>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
    requestAnimationFrame(() => this.refreshScrollReveal());
  }

  renderEducation(educations) {
    const container = document.getElementById('education-cards');
    if (!container) return;

    container.innerHTML = educations.map((edu, idx) => `
      <div class="education-card reveal-up stagger-${idx + 1}">
        <div class="edu-icon">🎓</div>
        <div class="edu-details">
          <div class="edu-header">
            <h3 class="edu-institution">${this.escapeHtml(edu.institution)}</h3>
            <span class="edu-status-badge">${this.escapeHtml(edu.status)}</span>
          </div>
          <h4 class="edu-degree">${this.escapeHtml(edu.degree)}</h4>
          ${edu.notes ? `<p class="edu-notes">${this.escapeHtml(edu.notes)}</p>` : ''}
        </div>
      </div>
    `).join('');
    requestAnimationFrame(() => this.refreshScrollReveal());
  }

  renderContactInfo(profile) {
    const emailEl = document.getElementById('contact-email-display');
    if (emailEl) {
      emailEl.textContent = profile.email;
      emailEl.href = `mailto:${profile.email}`;
    }

    const locEl = document.getElementById('contact-location-display');
    if (locEl) locEl.textContent = profile.location;

    const githubLink = document.getElementById('social-github');
    if (githubLink && profile.github) githubLink.href = profile.github;

    const linkedinLink = document.getElementById('social-linkedin');
    if (linkedinLink && profile.linkedin) linkedinLink.href = profile.linkedin;
  }

  openCVModal() {
    const modal = document.getElementById('cv-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    document.body.classList.add('js-scroll-animate');

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.scrollObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.01,
      rootMargin: '120px 0px 50px 0px'
    });

    this.refreshScrollReveal();
  }

  refreshScrollReveal() {
    const selectors = '.reveal-left, .reveal-right, .reveal-up, .reveal-scale, .reveal-on-scroll';
    const elements = document.querySelectorAll(selectors);

    // If observer exists, attach to non-revealed elements
    if (this.scrollObserver) {
      const windowHeight = window.innerHeight;
      elements.forEach(el => {
        if (el.classList.contains('revealed')) return;
        const rect = el.getBoundingClientRect();
        // Immediately reveal anything already on screen
        if (rect.top < windowHeight * 1.15 && rect.bottom > 0) {
          el.classList.add('revealed');
        } else {
          this.scrollObserver.observe(el);
        }
      });
    } else {
      elements.forEach(el => el.classList.add('revealed'));
    }
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
