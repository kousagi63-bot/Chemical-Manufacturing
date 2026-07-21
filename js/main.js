/**
 * ChemManufacture - Main Script
 * Handles interactivity, animations, and form validation.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // SCROLL-TRIGGERED ENTRANCE ANIMATIONS
  // ==========================================
  const animElements = document.querySelectorAll('[data-anim]');
  
  if (animElements.length > 0) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animElements.forEach(el => animObserver.observe(el));
  }

  // Safety fallback: make all animated elements visible after 2s
  // in case IntersectionObserver never fires for some elements
  setTimeout(() => {
    document.querySelectorAll('[data-anim]:not(.is-visible)').forEach(el => {
      el.classList.add('is-visible');
    });
  }, 2000);


  // ==========================================
  // STICKY HEADER
  // ==========================================
  const header = document.querySelector('.main-nav-wrapper');
  const stickyTrigger = 120;

  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY >= stickyTrigger) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  };

  if (header) {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }


  // ==========================================
  // MOBILE NAVIGATION DRAWER
  // ==========================================
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const closeDrawerBtn = document.querySelector('.close-drawer-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');

  const openDrawer = () => {
    const dashSidebar = document.querySelector('.dash-sidebar');
    if (dashSidebar) {
      dashSidebar.classList.add('open');
      backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
      return;
    }
    mobileDrawer.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevents background scroll
  };

  const closeDrawer = () => {
    const dashSidebar = document.querySelector('.dash-sidebar');
    if (dashSidebar) {
      dashSidebar.classList.remove('open');
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
      return;
    }
    mobileDrawer.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  };

  if (hamburgerBtn && closeDrawerBtn && mobileDrawer && backdrop) {
    hamburgerBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
  }


  // ==========================================
  // HERO SLIDER CAROUSEL
  // ==========================================
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevArrow = document.querySelector('.slider-arrow-left');
  const nextArrow = document.querySelector('.slider-arrow-right');
  
  if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval;
    const intervalDuration = 6000;

    // Create Navigation Dots
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const updateDots = () => {
      const dots = document.querySelectorAll('.slider-dot');
      dots.forEach((dot, index) => {
        if (index === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const goToSlide = (n) => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      updateDots();
      resetInterval();
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    if (nextArrow) nextArrow.addEventListener('click', nextSlide);
    if (prevArrow) prevArrow.addEventListener('click', prevSlide);

    const startInterval = () => {
      slideInterval = setInterval(nextSlide, intervalDuration);
    };

    const resetInterval = () => {
      clearInterval(slideInterval);
      startInterval();
    };

    // Initialize Slider
    slides[0].classList.add('active');
    startInterval();
  }


  // ==========================================
  // CLIENT TESTIMONIALS SLIDER
  // ==========================================
  const testimonialTrack = document.querySelector('.testimonials-track');
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const testimonialPrev = document.querySelector('.testimonial-arrow-left');
  const testimonialNext = document.querySelector('.testimonial-arrow-right');

  if (testimonialTrack && testimonialSlides.length > 0) {
    let activeTestimonial = 0;

    const updateTestimonialSlider = () => {
      const slideWidth = testimonialSlides[0].clientWidth;
      testimonialTrack.style.transform = `translateX(-${activeTestimonial * slideWidth}px)`;
    };

    const nextTestimonial = () => {
      activeTestimonial = (activeTestimonial + 1) % testimonialSlides.length;
      updateTestimonialSlider();
    };

    const prevTestimonial = () => {
      activeTestimonial = (activeTestimonial - 1 + testimonialSlides.length) % testimonialSlides.length;
      updateTestimonialSlider();
    };

    if (testimonialNext) testimonialNext.addEventListener('click', nextTestimonial);
    if (testimonialPrev) testimonialPrev.addEventListener('click', prevTestimonial);

    // Responsive update on resize
    window.addEventListener('resize', updateTestimonialSlider);
  }


  // ==========================================
  // COUNTER UP ANIMATION
  // ==========================================
  const counters = document.querySelectorAll('.stat-number');
  const counterSection = document.querySelector('.stats-counter-bar');

  if (counters.length > 0 && counterSection) {
    const runCounters = () => {
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const suffix = counter.getAttribute('data-suffix') || '';
        let count = 0;
        const speed = target / 40; // divide by steps

        const updateCount = () => {
          count += speed;
          if (count < target) {
            counter.innerText = Math.floor(count) + suffix;
            requestAnimationFrame(updateCount);
          } else {
            counter.innerText = target + suffix;
          }
        };
        updateCount();
      });
    };

    // Intersection Observer to trigger when section enters viewport
    let observerTriggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !observerTriggered) {
          observerTriggered = true;
          runCounters();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(counterSection);
  }


  // ==========================================
  // ISOTOPE PORTFOLIO FILTERING
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterButtons.length > 0 && portfolioItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Toggle Active Button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        portfolioItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          
          if (filterValue === 'all' || itemCategory === filterValue) {
            item.classList.remove('hidden');
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              if (item.style.opacity === '0') {
                item.classList.add('hidden');
              }
            }, 300); // matches transition time
          }
  // ==========================================
  // DASHBOARD SIDEBAR NAVIGATION
  // ==========================================
  const dashNavLinks = document.querySelectorAll('.dash-nav-link[data-section]');
  const dashSections = document.querySelectorAll('.dash-section');

  if (dashNavLinks.length > 0 && dashSections.length > 0) {
    dashNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');

        // Update active nav link
        dashNavLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show target section, hide others
        dashSections.forEach(section => {
          if (section.getAttribute('data-section') === targetSection) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        });

        // Scroll dash-main to top
        const dashMain = document.querySelector('.dash-main');
        if (dashMain) dashMain.scrollTop = 0;
      });
    });
  }


});
      });
    });
  }


  // ==========================================
  // PROJECT DETAILS MODAL DATABASE
  // ==========================================
  const projectDetailsDb = {
    "project-1": {
      title: "Petrochemical Refinery Expansion",
      category: "Petrochemical",
      image: "images/unsplash_23.webp",
      description: "Scale expansion of our catalytic cracking unit at the Southern Refinery Complex. The project integrates state-of-the-art flow automation, boosting overall ethylene production capacity by 35% while upgrading gas scrubbers to comply with modern clean air initiatives.",
      challenge: "Executing heavy industrial structural upgrades and piping configurations within an active high-pressure refinery zone without disrupting ongoing chemical synthesis workflows.",
      solution: "We deployed modular construction strategies, assembling critical pipelines and reactors off-site. The modules were integrated using phased scheduled shutdowns, limiting total production downtime to just 72 hours.",
      specs: {
        client: "Apex Energy Corp",
        location: "Houston, TX",
        duration: "14 Months",
        value: "$18.5 Million"
      }
    },
    "project-2": {
      title: "High-Performance Polymer Development",
      category: "Speciality",
      image: "images/image6.webp",
      description: "Synthesizing a next-generation lightweight thermoplastic polymer designed for high-stress structural components in electric vehicle frames. The polymer exhibits twice the structural strength of typical ABS plastics while maintaining a 20% lower density.",
      challenge: "Maintaining precise reaction temperatures in large batch sizes, as exothermic polymerizations run the risk of thermal runaway and material crystallization defects.",
      solution: "Implemented an automated microfluidic reactor line coupled with real-time infrared spectroscopy monitoring. This allows immediate feedback adjustments to stabilizer feeding rates.",
      specs: {
        client: "AeroMotion Vehicles",
        location: "Frankfurt, Germany",
        duration: "8 Months",
        value: "$4.2 Million"
      }
    },
    "project-3": {
      title: "Bio-Agrochemical Formulation",
      category: "Agrochem",
      image: "images/unsplash_25.webp",
      description: "Engineering an organic agricultural solution that enhances nutrient uptake in grain crops. The formulation uses plant-derived amino acids and microbial agents, providing high resistance to drought and root pathogens.",
      challenge: "Ensuring long shelf-life and chemical stability of the biological microorganisms suspended in liquid organic emulsions.",
      solution: "Designed a lipid-based microencapsulation matrix. The protective matrix keeps biological agents dormant until applied in soil, dissolving slowly to release active components over 30 days.",
      specs: {
        client: "VeraSoil Agriculture",
        location: "Des Moines, IA",
        duration: "11 Months",
        value: "$2.9 Million"
      }
    },
    "project-4": {
      title: "Eco-Friendly Catalyst R&D",
      category: "R&D",
      image: "images/unsplash_12.webp",
      description: "Developing a novel zeolite-based transition metal catalyst for nitrogen oxide (NOx) emission reduction in industrial boiler exhausts. The research focuses on catalyst activity at lower operational temperatures.",
      challenge: "Standard metal catalysts deteriorate rapidly in high-sulfur emissions. We had to modify the crystal lattice structure of the zeolite support to inhibit acid poisoning.",
      solution: "Engineered a specific aluminum-silicate framework laced with copper-nanoparticles. This increases sulfur tolerance by 300% and extends average catalyst lifespans to over 5 years.",
      specs: {
        client: "GreenTech Utilities",
        location: "Kyoto, Japan",
        duration: "24 Months",
        value: "$7.1 Million"
      }
    },
    "project-5": {
      title: "Speciality Chemical Batch Plant",
      category: "Speciality",
      image: "images/unsplash_26.webp",
      description: "Designing and commissioning an automated multi-purpose chemical synthesis batch plant. The plant manufactures fine chemical intermediates for pharmaceutical developers and food stabilizers.",
      challenge: "Building a highly flexible reactor configuration capable of switching synthesis paths without cross-contamination between pharmaceutical-grade batches.",
      solution: "Installed CIP (Clean-in-Place) automated solvent washing cycles and a fully automated valve matrix to isolate pipelines, validated using inline chromatographic purity sensors.",
      specs: {
        client: "PharmaSynthese Ltd",
        location: "Lyon, France",
        duration: "18 Months",
        value: "$12.4 Million"
      }
    },
    "project-6": {
      title: "Industrial Wastewater Purification",
      category: "Eco-Friendly",
      image: "images/unsplash_27.webp",
      description: "Upgrading a chemical manufacturing plant's wastewater treatment facility. The new system integrates advanced oxidation processes (AOP) with membrane bioreactors, ensuring zero-liquid discharge (ZLD).",
      challenge: "Treating complex effluents containing halogenated organic compounds, which resist standard biological treatments and clog filter membranes.",
      solution: "Combined UV/Hydrogen Peroxide oxidation towers upstream to break down halogenated rings, followed by robust ceramic nano-filtration membranes which have long lifespans under abrasive washings.",
      specs: {
        client: "Global ChemCorp",
        location: "Rotterdam, Netherlands",
        duration: "9 Months",
        value: "$5.8 Million"
      }
    }
  };


  // ==========================================
  // PROJECT MODAL HANDLER
  // ==========================================
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal-close-btn');
  const openModalButtons = document.querySelectorAll('.portfolio-btn');

  const openProjectModal = (projectId) => {
    if (!modal) return;
    const data = projectDetailsDb[projectId];
    if (!data) return;

    // Populate Modal Content
    modal.querySelector('.modal-img-wrap img').src = data.image;
    modal.querySelector('.modal-img-wrap img').alt = data.title;
    modal.querySelector('.modal-category-meta').innerText = data.category;
    modal.querySelector('.modal-title').innerText = data.title;
    modal.querySelector('.modal-desc-main').innerText = data.description;
    modal.querySelector('.modal-desc-challenge').innerText = data.challenge;
    modal.querySelector('.modal-desc-solution').innerText = data.solution;
    
    // Specs
    modal.querySelector('.spec-client').innerText = data.specs.client;
    modal.querySelector('.spec-location').innerText = data.specs.location;
    modal.querySelector('.spec-duration').innerText = data.specs.duration;
    modal.querySelector('.spec-value').innerText = data.specs.value;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  };

  if (openModalButtons.length > 0 && modal && modalClose) {
    openModalButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const item = e.target.closest('.portfolio-item');
        if (item) {
          const id = item.getAttribute('data-id');
          openProjectModal(id);
        }
      });
    });

    modalClose.addEventListener('click', closeProjectModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProjectModal();
      }
    });

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeProjectModal();
      }
    });
  }


  // ==========================================
  // CONTACT FORM VALIDATION & SUBMISSION
  // ==========================================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;
      const fields = [
        { id: 'contactName', rules: { required: true, minLength: 3 } },
        { id: 'contactEmail', rules: { required: true, email: true } },
        { id: 'contactPhone', rules: { phone: true } },
        { id: 'contactSubject', rules: { required: true, minLength: 5 } },
        { id: 'contactMessage', rules: { required: true, minLength: 15 } }
      ];

      fields.forEach(field => {
        const input = document.getElementById(field.id);
        const group = input.closest('.form-group');
        const errorMsg = group.querySelector('.form-error-msg');
        let errorText = '';

        if (input) {
          const val = input.value.trim();

          if (field.rules.required && !val) {
            errorText = 'This field is required.';
          } else if (field.rules.minLength && val.length < field.rules.minLength) {
            errorText = `Must be at least ${field.rules.minLength} characters.`;
          } else if (field.rules.email && val) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
              errorText = 'Please enter a valid email address.';
            }
          } else if (field.rules.phone && val) {
            const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
            if (!phoneRegex.test(val)) {
              errorText = 'Please enter a valid phone number.';
            }
          }

          if (errorText) {
            group.classList.add('has-error');
            errorMsg.innerText = errorText;
            hasErrors = true;
          } else {
            group.classList.remove('has-error');
            errorMsg.innerText = '';
          }
        }
      });

      if (!hasErrors) {
        window.location.href = '404.html';
      }
    });

    // Remove error class on input keystroke
    const inputs = contactForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group.classList.contains('has-error')) {
          group.classList.remove('has-error');
        }
      });
    });
  }


  // ==========================================
  // DASHBOARD SIDEBAR NAVIGATION
  // ==========================================
  const dashNavLinks = document.querySelectorAll('.dash-nav-link[data-section]');
  const dashSections = document.querySelectorAll('.dash-section');

  if (dashNavLinks.length > 0 && dashSections.length > 0) {
    dashNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');

        // Update active nav link
        dashNavLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show target section, hide others
        dashSections.forEach(section => {
          if (section.getAttribute('data-section') === targetSection) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        });

        // Scroll dash-main to top
        const dashMain = document.querySelector('.dash-main');
        if (dashMain) dashMain.scrollTop = 0;
      });
    });
  }

  // ==========================================
  // DASHBOARD SIDEBAR CLOSE (MOBILE)
  // ==========================================
  const dashSidebarClose = document.querySelector('.dash-sidebar-close');
  if (dashSidebarClose) {
    dashSidebarClose.addEventListener('click', closeDrawer);
  }

  // Close sidebar on nav link click (mobile)
  if (dashNavLinks.length > 0) {
    dashNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        const sidebar = document.querySelector('.dash-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          closeDrawer();
        }
      });
    });
  }

  // ==========================================
  // DASHBOARD FORM VALIDATION
  // ==========================================
  function validateDashForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = form.querySelector('.dash-form-msg');
      const fields = form.querySelectorAll('input, select');
      let allFilled = true;
      fields.forEach(function(field) {
        if (!field.value.trim()) allFilled = false;
      });
      if (!allFilled) {
        if (msg) {
          msg.textContent = 'Please fill in all fields before submitting.';
          msg.style.display = 'block';
        }
        return;
      }
      if (msg) msg.style.display = 'none';
      window.location.href = '404.html';
    });
  }
  validateDashForm('personalInfoForm');
  validateDashForm('updatePasswordForm');
  validateDashForm('adminSettingsForm');
  validateDashForm('adminPasswordForm');

  // ==========================================
  // VIDEO BACKGROUND AUTOPLAY FALLBACK
  // ==========================================
  document.querySelectorAll('.hero-bg-video, .banner-bg-video').forEach(v => {
    v.play().catch(() => {});
  });

});
