/**
 * Default Seed Data for Ali Hassen Portfolio
 * Strictly adheres to verified positioning: Web Developer & Digital Creative
 */

const DEFAULT_DATA = {
  profile: {
    name: "Ali Hassen",
    headline: "Web Developer",
    secondaryTitle: "Web Developer • AI-Assisted Development • Digital Creative",
    tagline: "I build modern websites and digital experiences with code, creativity, and AI-assisted workflows.",
    location: "Alexandria, Egypt",
    status: "Available for select web projects & junior roles",
    bio: [
      "I am an early-career web developer and Computer & Information Science student at Alexandria University. I focus on building responsive websites, high-converting landing pages, and customized WordPress experiences.",
      "Alongside web development, I bring practical experience in digital marketing, content strategy, video editing, and script writing. This multidisciplinary background gives me a distinct advantage: I don't just write code, I understand how websites communicate, convert, and represent a brand in the real world.",
      "I leverage AI tools intelligently to accelerate prototyping, debugging, and development workflows — while ensuring every line of code, layout decision, and final detail is human-crafted, reviewed, and intentional."
    ],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    email: "alihassen.dev@example.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    cvDownloadUrl: "#download-cv"
  },
  aiPhilosophy: {
    tagline: "BUILDING WITH AI, NOT HIDING BEHIND IT.",
    description: "AI is a formidable development accelerator, not a substitute for engineering intuition and visual taste. Here is how I integrate modern AI workflows to deliver faster, cleaner, and more impactful web products:",
    pillars: [
      {
        icon: "⚡",
        title: "Accelerated Prototyping & Layouts",
        desc: "Rapidly exploring design concepts, component structures, and responsive layouts to iterate 3x faster without starting from zero."
      },
      {
        icon: "🔍",
        title: "Intelligent Debugging & Code Optimization",
        desc: "Utilizing AI models to identify edge-case bugs, optimize CSS/JS performance, and explore alternative implementation approaches."
      },
      {
        icon: "🎨",
        title: "Human Curation & Visual Taste",
        desc: "AI produces raw options; human judgment refines them into polished, cohesive, and brand-tailored digital experiences."
      },
      {
        icon: "🎯",
        title: "Content & Strategy Integration",
        desc: "Combining marketing insights with AI ideation to ensure every page copy, headline, and call-to-action is structured to convert."
      }
    ]
  },
  skillCategories: [
    {
      id: "primary",
      name: "Primary — Web Development",
      highlight: true,
      skills: [
        "Website Development",
        "Landing Pages",
        "WordPress",
        "Front-End Development",
        "Responsive Web Design",
        "UI Implementation",
        "AI-Assisted Development"
      ]
    },
    {
      id: "secondary",
      name: "Secondary — Digital & Creative",
      highlight: false,
      skills: [
        "Digital Marketing",
        "Content Creation",
        "Content Strategy",
        "Video Editing",
        "Script Writing",
        "Social Media",
        "Audience Engagement"
      ]
    },
    {
      id: "tools",
      name: "Tools & Software",
      highlight: false,
      skills: [
        "AI Tools",
        "WordPress",
        "Filmora",
        "Photoshop",
        "Microsoft Office"
      ]
    }
  ],
  projectCategories: [
    "All",
    "Websites",
    "Landing Pages",
    "WordPress",
    "Digital Projects",
    "Content / Creative"
  ],
  projects: [
    {
      id: "proj-1",
      name: "Aura Creative Studio Landing Page",
      category: "Landing Pages",
      type: "High-Converting Agency Landing Page",
      featured: true,
      summary: "A sleek, responsive landing page engineered with AI-assisted design exploration and custom front-end interactions.",
      technologies: ["HTML5", "Modern CSS3", "JavaScript", "AI Prototyping Tools", "Responsive Design"],
      websiteUrl: "https://example.com/aura-studio",
      githubUrl: "",
      screenshot: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
      ],
      client: "Creative Studio Concept",
      date: "2026",
      whatWasBuilt: "Complete responsive single-page experience featuring glassmorphism accents, dynamic micro-interactions, custom pricing calculator, and optimized contact conversion funnel.",
      objective: "Create an ultra-modern landing page that balances high visual aesthetics with fast load times and clear value propositions.",
      designApproach: "Dark-mode aesthetic with subtle glowing neon borders, clean typographic hierarchy, and intuitive content chunking for rapid scanning.",
      developmentApproach: "Used AI to draft CSS animation keyframes and responsive grid formulas, then meticulously refactored and tested across modern browsers for seamless 60fps performance.",
      features: [
        "Interactive services accordion",
        "Real-time contact estimation modal",
        "Mobile-first responsive fluid navigation",
        "Fast asset loading and zero heavy framework overhead"
      ],
      result: "Achieved 98+ Lighthouse performance score and created an engaging brand showcase with intuitive user flow."
    },
    {
      id: "proj-2",
      name: "Novus Commerce — WordPress Brand Portal",
      category: "WordPress",
      type: "Custom WordPress Website & CMS",
      featured: true,
      summary: "Customized WordPress business portal tailored for clear product storytelling and intuitive client content management.",
      technologies: ["WordPress", "Custom CSS", "AI Workflow Tools", "Photoshop"],
      websiteUrl: "https://example.com/novus-wp",
      githubUrl: "",
      screenshot: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
      ],
      client: "Independent Brand",
      date: "2026",
      whatWasBuilt: "Full WordPress setup with bespoke child theme styling, customized block layouts, and streamlined editorial publishing workflows.",
      objective: "Provide the client with an easy-to-update web platform that maintains a polished, premium aesthetic across all blog and service pages.",
      designApproach: "Balanced minimalist typography with rich visual cards and clear CTAs positioned at strategic scroll depths.",
      developmentApproach: "Structured modular page templates, optimized image assets via Photoshop, and integrated AI-assisted copy structure for optimal readability.",
      features: [
        "Customized WordPress theme templates",
        "Dynamic case study portfolio showcase",
        "SEO-friendly semantic structure and metadata",
        "Client-friendly dashboard editing setup"
      ],
      result: "Delivered an effortlessly maintainable website that empowers non-technical editors to publish rich content in minutes."
    },
    {
      id: "proj-3",
      name: "Pulse Marketing Hub & Digital Campaign",
      category: "Digital Projects",
      type: "Multi-channel Campaign & Web Experience",
      featured: false,
      summary: "Integrated digital project combining targeted landing page architecture with engaging video content and messaging strategy.",
      technologies: ["Landing Pages", "Filmora", "Content Strategy", "Digital Marketing", "Photoshop"],
      websiteUrl: "",
      githubUrl: "",
      screenshot: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=1200&q=80",
      gallery: [],
      client: "Digital Campaign",
      date: "2025 - 2026",
      whatWasBuilt: "Conversion-focused landing page accompanied by video promotional scripts and social media visual assets.",
      objective: "Demonstrate end-to-end synergy between web development and digital creative marketing execution.",
      designApproach: "High-contrast visual messaging, punchy headlines, and clear visual cues leading directly to conversion checkpoints.",
      developmentApproach: "Authored tailored video scripts, edited promotional reels in Filmora, and connected the campaign funnel directly to a dedicated web landing page.",
      features: [
        "Hook-driven video marketing assets",
        "Conversion-optimized CTA buttons and forms",
        "Harmonious visual branding across social channels and web"
      ],
      result: "Showcases Ali's ability to blend web development with practical marketing execution."
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "European College for International Studies — ECIS",
      role: "Marketing Manager",
      status: "Ended — August 2026",
      startDate: "", // Confirmed: No start date displayed/invented
      endDate: "August 2026",
      highlights: [
        "Led marketing strategies, campaign development, and digital outreach initiatives.",
        "Oversaw digital communication channels, content creation, and promotional messaging.",
        "Gained deep hands-on insight into conversion optimization and user acquisition that now directly informs web development decisions."
      ]
    },
    {
      id: "exp-2",
      company: "Saudi Company for Franchising & Business Development",
      role: "Marketing Manager",
      status: "Marketing Leadership",
      startDate: "", // Confirmed: No start date displayed/invented
      endDate: "",
      highlights: [
        "Managed business promotion, marketing initiatives, and brand positioning.",
        "Coordinated creative campaigns and audience engagement strategies."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Alexandria University",
      degree: "Computer & Information Science",
      status: "Current Student",
      notes: "Focusing on core computing principles, web technologies, software architecture, and modern development paradigms."
    }
  ]
};
