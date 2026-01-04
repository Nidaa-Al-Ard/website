// scripts/language-manager.js
const LanguageManager = {
    currentLang: 'ar', // Default language
    translations: {},   // Will hold loaded translations

    // Initialize: load language preference from browser/localStorage
    init: async function() {
        const savedLang = localStorage.getItem('ecoReviveLang') || navigator.language.split('-')[0];
        // Default to Arabic if saved language is not 'en' or 'fr'
        this.currentLang = (savedLang === 'en' || savedLang === 'fr') ? savedLang : 'ar';
        await this.loadTranslations(this.currentLang);
        this.setDocumentDirection();
        return this.currentLang;
    },

    // Load the JSON file for a specific language
    loadTranslations: async function(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) throw new Error(`Language file not found: ${lang}.json`);
            this.translations = await response.json();
            this.currentLang = lang;
            localStorage.setItem('ecoReviveLang', lang);
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to Arabic if there's an error
            if (lang !== 'ar') {
                await this.loadTranslations('ar');
            }
        }
    },

    // Apply translations to the current page
    applyTranslations: function() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
                // If it's a placeholder attribute (for input/textarea)
                if (element.hasAttribute('data-i18n-placeholder')) {
                    element.setAttribute('placeholder', this.translations[key]);
                }
            }
        });
        // Update page title
        const pageTitles = {
            'ar': 'إيكو ريفايف | منظمة إعادة التدوير غير الربحية',
            'en': 'EcoRevive | Recycling Nonprofit Organization',
            'fr': 'EcoRevive | Organisation à but non lucratif de recyclage'
        };
        document.title = pageTitles[this.currentLang] || pageTitles['ar'];
    },

    // Change language and update the entire page
    changeLanguage: async function(lang) {
        if (lang === this.currentLang) return;
        await this.loadTranslations(lang);
        this.setDocumentDirection();
        this.applyTranslations();
        // Dispatch a custom event so app.js knows to update the UI
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    },

    // Set the document direction (RTL/LTR) based on language
    setDocumentDirection: function() {
        const html = document.documentElement;
        html.setAttribute('lang', this.currentLang);
        html.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
    },

    // Get a translation by key (useful for dynamic content in JS)
    getTranslation: function(key) {
        return this.translations[key] || `[${key}]`;
    }
};

// Make it available globally
export default LanguageManager;