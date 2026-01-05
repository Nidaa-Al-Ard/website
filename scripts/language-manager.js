// language-manager.js - UPDATED
const LanguageManager = {
    currentLang: 'ar',
    translations: {},
    initialized: false,

    // ALWAYS start with Arabic
    init: async function() {
        if (this.initialized) return this.currentLang;
        
        // STEP 1: Force Arabic on first visit
        const isFirstVisit = !localStorage.getItem('earthCallLang');
        if (isFirstVisit) {
            localStorage.setItem('earthCallLang', 'ar');
        }
        
        // STEP 2: Get saved language (Arabic by default)
        const savedLang = localStorage.getItem('earthCallLang') || 'ar';
        
        // STEP 3: Only allow our three languages
        this.currentLang = ['ar', 'en', 'fr'].includes(savedLang) ? savedLang : 'ar';
        
        // STEP 4: Always set Arabic direction first
        this.setDocumentDirection(this.currentLang);
        
        // STEP 5: Load translations
        await this.loadTranslations(this.currentLang);
        
        this.initialized = true;
        console.log('🌍 Language initialized:', this.currentLang);
        return this.currentLang;
    },

    // Load translations with Arabic fallback
    loadTranslations: async function(lang) {
        try {
            // Try to load requested language
            const response = await fetch(`locales/${lang}.json`);
            if (response.ok) {
                this.translations = await response.json();
                this.currentLang = lang;
                localStorage.setItem('earthCallLang', lang);
                return;
            }
        } catch (error) {
            console.warn(`Could not load ${lang}.json:`, error);
        }
        
        // If failed, load Arabic as fallback
        if (lang !== 'ar') {
            console.log('Falling back to Arabic...');
            await this.loadTranslations('ar');
        }
    },

    // Set document direction immediately
    setDocumentDirection: function(lang = 'ar') {
        const html = document.documentElement;
        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        
        // Also update body class for CSS targeting
        document.body.classList.remove('lang-ar', 'lang-en', 'lang-fr');
        document.body.classList.add(`lang-${lang}`);
    },

    // Change language
    changeLanguage: async function(lang) {
        if (lang === this.currentLang || !['ar', 'en', 'fr'].includes(lang)) return;
        
        // Update direction immediately (better UX)
        this.setDocumentDirection(lang);
        
        // Load translations
        await this.loadTranslations(lang);
        
        // Apply translations
        this.applyTranslations();
        
        // Update UI
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { lang, previousLang: this.currentLang } 
        }));
    },

    // Apply translations to page
    applyTranslations: function() {
        if (!this.translations || Object.keys(this.translations).length === 0) {
            console.warn('No translations to apply');
            return;
        }
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
                
                // Handle input placeholders
                if (element.hasAttribute('placeholder') && this.translations[`${key}_placeholder`]) {
                    element.setAttribute('placeholder', this.translations[`${key}_placeholder`]);
                }
            }
        });
        
        // Update page title
        this.updatePageTitle();
    },

    // Update page title based on language
    updatePageTitle: function() {
        const titles = {
            'ar': 'نداء الأرض | منظمة إعادة التدوير غير الربحية',
            'en': 'Earth\'s Call | Recycling Nonprofit Organization',
            'fr': 'Appel de la Terre | Organisation à but non lucratif de recyclage'
        };
        document.title = titles[this.currentLang] || titles.ar;
    },

    // Get translation
    getTranslation: function(key) {
        return this.translations[key] || `[${key}]`;
    },

    // Reset to Arabic
    resetToArabic: function() {
        localStorage.setItem('earthCallLang', 'ar');
        this.changeLanguage('ar');
    }
};

window.LanguageManager = LanguageManager;