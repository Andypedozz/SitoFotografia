// fade-slide-effect.js
class FadeSlideEffect {
  constructor(options = {}) {
    this.defaults = {
      duration: 600,
      delay: 0,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      distance: 30,
      opacity: true,
      slide: true,
      trigger: 'auto', // 'auto', 'scroll', 'hover', 'click', 'manual'
      once: true, // Animazione eseguita solo una volta
      threshold: 0.1, // Percentuale di visibilità per trigger 'scroll'
      rootMargin: '0px',
      className: 'fade-slide-element',
      activeClass: 'fade-slide-active',
      disabledClass: 'fade-slide-disabled'
    };
    
    this.config = { ...this.defaults, ...options };
    this.elements = [];
    this.observers = new Map();
    
    this.initStyles();
  }
  
  // Inizializza gli stili CSS
  initStyles() {
    if (document.getElementById('fade-slide-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'fade-slide-styles';
    style.textContent = `
      .${this.config.className} {
        opacity: 0;
        transform: translateY(${this.config.distance}px);
        transition-property: opacity, transform;
        transition-duration: ${this.config.duration}ms;
        transition-timing-function: ${this.config.easing};
        transition-delay: 0ms;
        will-change: opacity, transform;
      }
      
      .${this.config.className}.${this.config.activeClass} {
        opacity: 1;
        transform: translateY(0);
      }
      
      .${this.config.className}.${this.config.disabledClass} {
        opacity: 1;
        transform: translateY(0);
        transition: none !important;
      }
      
      /* Varianti */
      .fade-slide-no-opacity {
        opacity: 1 !important;
      }
      
      .fade-slide-no-slide {
        transform: translateY(0) !important;
      }
      
      /* Direzioni */
      .fade-slide-left {
        transform: translateX(${this.config.distance}px) !important;
      }
      
      .fade-slide-left.${this.config.activeClass} {
        transform: translateX(0) !important;
      }
      
      .fade-slide-right {
        transform: translateX(-${this.config.distance}px) !important;
      }
      
      .fade-slide-right.${this.config.activeClass} {
        transform: translateX(0) !important;
      }
      
      .fade-slide-down {
        transform: translateY(-${this.config.distance}px) !important;
      }
      
      .fade-slide-down.${this.config.activeClass} {
        transform: translateY(0) !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Applica l'effetto a un elemento
  applyTo(element, options = {}) {
    const elementConfig = { ...this.config, ...options };
    
    // Aggiungi classi base
    element.classList.add(this.config.className);
    
    if (!elementConfig.opacity) {
      element.classList.add('fade-slide-no-opacity');
    }
    
    if (!elementConfig.slide) {
      element.classList.add('fade-slide-no-slide');
    }
    
    // Aggiungi direzione se specificata
    if (options.direction) {
      element.classList.add(`fade-slide-${options.direction}`);
    }
    
    // Imposta le transizioni CSS
    element.style.transitionDuration = `${elementConfig.duration}ms`;
    element.style.transitionDelay = `${elementConfig.delay}ms`;
    
    // Gestisci il trigger
    this.setupTrigger(element, elementConfig);
    
    // Salva riferimento
    this.elements.push({ element, config: elementConfig });
    
    return {
      show: () => this.show(element),
      hide: () => this.hide(element),
      toggle: () => this.toggle(element),
      destroy: () => this.destroy(element)
    };
  }
  
  // Applica a tutti gli elementi con un selettore
  applyToAll(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const controllers = [];
    
    elements.forEach(element => {
      controllers.push(this.applyTo(element, options));
    });
    
    return controllers;
  }
  
  // Setup del trigger
  setupTrigger(element, config) {
    switch (config.trigger) {
      case 'auto':
        this.animate(element);
        break;
        
      case 'scroll':
        this.setupScrollTrigger(element, config);
        break;
        
      case 'hover':
        this.setupHoverTrigger(element, config);
        break;
        
      case 'click':
        this.setupClickTrigger(element, config);
        break;
        
      case 'manual':
        // Nessun trigger automatico
        break;
    }
  }
  
  // Trigger scroll con IntersectionObserver
  setupScrollTrigger(element, config) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(element);
          if (config.once) {
            observer.unobserve(element);
          }
        } else if (!config.once) {
          this.reset(element);
        }
      });
    }, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });
    
    observer.observe(element);
    this.observers.set(element, observer);
  }
  
  // Trigger hover
  setupHoverTrigger(element, config) {
    let timeout;
    
    element.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      this.animate(element);
    });
    
    element.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        this.reset(element);
      }, 200);
    });
  }
  
  // Trigger click
  setupClickTrigger(element, config) {
    element.addEventListener('click', (e) => {
      if (element.classList.contains(this.config.activeClass)) {
        this.reset(element);
      } else {
        this.animate(element);
      }
    });
  }
  
  // Mostra l'elemento (animazione in)
  show(element) {
    return new Promise(resolve => {
      // Forza un reflow per assicurare che la transizione funzioni
      void element.offsetWidth;
      
      element.classList.add(this.config.activeClass);
      
      setTimeout(() => {
        resolve();
      }, this.getDuration(element));
    });
  }
  
  // Nascondi l'elemento (animazione out)
  hide(element) {
    return new Promise(resolve => {
      element.classList.remove(this.config.activeClass);
      
      setTimeout(() => {
        resolve();
      }, this.getDuration(element));
    });
  }
  
  // Alterna visibilità
  toggle(element) {
    if (element.classList.contains(this.config.activeClass)) {
      return this.hide(element);
    } else {
      return this.show(element);
    }
  }
  
  // Esegui animazione (shortcut per show)
  animate(element) {
    return this.show(element);
  }
  
  // Reset all'stato iniziale
  reset(element) {
    element.classList.remove(this.config.activeClass);
  }
  
  // Ottieni durata animazione per un elemento
  getDuration(element) {
    const config = this.elements.find(e => e.element === element)?.config;
    return (config?.duration || this.config.duration) + (config?.delay || 0);
  }
  
  // Distruggi un elemento
  destroy(element) {
    // Rimuovi classi
    element.classList.remove(
      this.config.className,
      this.config.activeClass,
      'fade-slide-no-opacity',
      'fade-slide-no-slide',
      'fade-slide-left',
      'fade-slide-right',
      'fade-slide-down'
    );
    
    // Rimuovi stili inline
    element.style.transitionDuration = '';
    element.style.transitionDelay = '';
    
    // Rimuovi observer se presente
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      this.observers.delete(element);
    }
    
    // Rimuovi dai riferimenti
    this.elements = this.elements.filter(e => e.element !== element);
    
    // Rimuovi event listeners
    element.replaceWith(element.cloneNode(true));
  }
  
  // Distruggi tutto
  destroyAll() {
    this.elements.forEach(({ element }) => {
      this.destroy(element);
    });
    
    // Rimuovi stili
    const style = document.getElementById('fade-slide-styles');
    if (style) {
      style.remove();
    }
  }
  
  // Stagger effect per una lista di elementi
  stagger(elements, options = {}) {
    const staggerDelay = options.staggerDelay || 100;
    const promises = [];
    
    elements.forEach((element, index) => {
      const elementOptions = {
        ...options,
        delay: (options.delay || 0) + (index * staggerDelay)
      };
      
      const controller = this.applyTo(element, elementOptions);
      
      if (options.trigger === 'auto' || options.immediate) {
        promises.push(controller.show());
      }
    });
    
    return Promise.all(promises);
  }
}

// Crea istanza globale
window.FadeSlideEffect = FadeSlideEffect;