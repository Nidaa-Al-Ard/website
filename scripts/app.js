// scripts/app.js - Enhanced with Loading State
import LanguageManager from './language-manager.js';

const App = {
    currentPage: 'home',

    // Initialize the entire application
    init: async function() {
        try {
            // 1. Initialize language
            const lang = await LanguageManager.init();
            
            // 2. Load and render the common layout (header/footer)
            await this.loadCommonLayout();
            
            // 3. Set up navigation and load the initial page
            this.setupNavigation();
            await this.loadPage(this.currentPage);
            
            // 4. Set up language switcher buttons
            this.setupLanguageSwitcher();
            
            // 5. Set up accessibility features
            this.setupAccessibility();
            
            // 6. Hide loading indicator
            this.hideLoadingIndicator();
            
            // Listen for language changes to update UI elements
            window.addEventListener('languageChanged', (e) => {
                this.updateActiveLanguageButton(e.detail);
            });
            
            // Handle browser back/forward
            window.addEventListener('popstate', (e) => {
                const page = location.hash.replace('#', '') || 'home';
                this.loadPage(page, false);
            });
            
            console.log('App initialized in', lang, 'language');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load the website. Please try refreshing the page.');
            this.hideLoadingIndicator();
        }
    },

    // Hide the loading indicator
    hideLoadingIndicator: function() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 300);
        }
    },

    // Show error message
    showError: function(message) {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="error-container container">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>خطأ في التحميل</h2>
                        <p>${message}</p>
                        <button onclick="window.location.reload()" class="btn">
                            إعادة تحميل الصفحة
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // Load header and footer templates
    loadCommonLayout: async function() {
        try {
            // Add skip to content link for accessibility
            const skipLink = document.createElement('a');
            skipLink.href = '#page-content';
            skipLink.className = 'skip-to-content';
            skipLink.textContent = LanguageManager.currentLang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content';
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Render header and footer
            this.renderHeader();
            this.renderFooter();
        } catch (error) {
            console.error('Failed to load layout:', error);
            throw error;
        }
    },

    // Render the header with navigation
    renderHeader: function() {
        const header = document.getElementById('main-header');
        if (!header) return;
        
        const isArabic = LanguageManager.currentLang === 'ar';
        const navHome = LanguageManager.getTranslation('nav_home');
        const navAbout = LanguageManager.getTranslation('nav_about');
        
        header.innerHTML = `
            <div class="container header-content">
                <div class="logo">
                    <a href="#home" class="logo-link" data-page="home" aria-label="${isArabic ? 'نداء الأرض - الصفحة الرئيسية' : 'Earth\'s Call - Home'}">
                        
                        <div class="logo-text">${isArabic ? 'نداء الأرض' : 'Earth\'s Call'}</div>
                    </a>
                </div>
                
                <nav aria-label="الملاحة الرئيسية">
                    <ul>
                        <li><a href="#home" class="nav-link ${this.currentPage === 'home' ? 'active' : ''}" data-page="home" aria-current="${this.currentPage === 'home' ? 'page' : 'false'}">${navHome}</a></li>
                        <li><a href="#about" class="nav-link ${this.currentPage === 'about' ? 'active' : ''}" data-page="about" aria-current="${this.currentPage === 'about' ? 'page' : 'false'}">${navAbout}</a></li>
                    </ul>
                </nav>
                
                <div class="lang-switcher" aria-label="تبديل اللغة">
                    <button class="lang-btn ${LanguageManager.currentLang === 'ar' ? 'active' : ''}" data-lang="ar" aria-label="العربية" ${LanguageManager.currentLang === 'ar' ? 'aria-pressed="true"' : 'aria-pressed="false"'}>العربية</button>
                    <button class="lang-btn ${LanguageManager.currentLang === 'en' ? 'active' : ''}" data-lang="en" aria-label="English" ${LanguageManager.currentLang === 'en' ? 'aria-pressed="true"' : 'aria-pressed="false"'}>English</button>
                    <button class="lang-btn ${LanguageManager.currentLang === 'fr' ? 'active' : ''}" data-lang="fr" aria-label="Français" ${LanguageManager.currentLang === 'fr' ? 'aria-pressed="true"' : 'aria-pressed="false"'}>Français</button>
                </div>
            </div>
        `;
    },

    // Render the footer
    renderFooter: function() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        
        const isArabic = LanguageManager.currentLang === 'ar';
        const footerText = LanguageManager.getTranslation('footer_text');
        const copyrightText = LanguageManager.getTranslation('copyright');
        
        footer.innerHTML = `
            <div class="container footer-content">
                <div class="logo">
                    <i class="fas fa-recycle" aria-hidden="true"></i>
                    <div class="logo-text">${isArabic ? 'نداء الأرض' : 'Earth\'s Call'}</div>
                </div>
                
                <p>${footerText}</p>
                
                <div class="social-links" aria-label="وسائل التواصل الاجتماعي">
                    <a href="#" aria-label="فيسبوك"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
                    <a href="#" aria-label="تويتر"><i class="fab fa-twitter" aria-hidden="true"></i></a>
                    <a href="#" aria-label="إنستجرام"><i class="fab fa-instagram" aria-hidden="true"></i></a>
                    <a href="#" aria-label="لينكد إن"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>
                </div>
                
                <div class="copyright">
                    <p>${copyrightText}</p>
                </div>
            </div>
        `;
    },

    // Set up accessibility features
    setupAccessibility: function() {
        // Focus management for screen readers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or menus
                document.activeElement.blur();
            }
        });
    },

    // Set up navigation event listeners
    setupNavigation: function() {
        // Handle clicks on nav links
        document.addEventListener('click', (e) => {
            // Navigation links
            if (e.target.matches('.nav-link') || e.target.matches('.logo-link')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            }
        });
    },

    // Load a page from the /pages/ directory
    loadPage: async function(pageName, pushState = true) {
        try {
            // Update current page
            this.currentPage = pageName;
            
            // Update UI immediately for better UX
            document.querySelectorAll('.nav-link').forEach(link => {
                const linkPage = link.getAttribute('data-page');
                link.classList.remove('active');
                link.setAttribute('aria-current', 'false');
                
                if (linkPage === pageName) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
            
            // Load page HTML
            const response = await fetch(`./pages/${pageName}.html`);
            if (!response.ok) throw new Error(`Page not found: ${pageName}`);
            
            const pageHtml = await response.text();
            const pageContent = document.getElementById('page-content');
            
            if (pageContent) {
                // Add loading state
                pageContent.innerHTML = '<div class="page-loading"><i class="fas fa-spinner fa-spin"></i></div>';
                
                // Small delay to show loading state (better UX)
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Insert new content
                pageContent.innerHTML = pageHtml;
                
                // Apply translations to the new page content
                LanguageManager.applyTranslations();
                
                // Set focus to main content for accessibility
                pageContent.setAttribute('tabindex', '-1');
                pageContent.focus();
                
                // Update browser history
                if (pushState) {
                    history.pushState({ page: pageName }, '', `#${pageName}`);
                }
                
                // Update page title
                this.updatePageTitle(pageName);
                
                // Scroll to top with smooth behavior
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showPageError(error.message);
        }
    },

    // Update page title based on current page and language
    updatePageTitle: function(pageName) {
        const isArabic = LanguageManager.currentLang === 'ar';
        const titles = {
            'home': isArabic ? 'الصفحة الرئيسية | نداء الأرض' : 'Home | Earth\'s Call',
            'about': isArabic ? 'عن المنظمة | نداء الأرض' : 'About Us | Earth\'s Call'
        };
        
        const baseTitle = isArabic ? 'نداء الأرض | منظمة إعادة التدوير غير الربحية' : 'Earth\'s Call | Recycling Nonprofit';
        const pageTitle = titles[pageName] || baseTitle;
        
        document.title = pageTitle;
    },

    // Show page error
    showPageError: function(errorMessage) {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            const isArabic = LanguageManager.currentLang === 'ar';
            
            pageContent.innerHTML = `
                <div class="error-container container">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>${isArabic ? 'حدث خطأ' : 'An Error Occurred'}</h2>
                        <p>${isArabic ? 'تعذر تحميل الصفحة المطلوبة.' : 'Unable to load the requested page.'}</p>
                        <div class="error-actions">
                            <a href="#home" class="btn btn-primary" data-page="home">
                                ${isArabic ? 'العودة للرئيسية' : 'Back to Home'}
                            </a>
                            <button onclick="window.location.reload()" class="btn btn-secondary">
                                ${isArabic ? 'إعادة التحميل' : 'Reload Page'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Re-attach navigation listeners
            this.setupNavigation();
        }
    },

    // Set up language switcher buttons
    setupLanguageSwitcher: function() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.lang-btn')) {
                const lang = e.target.getAttribute('data-lang');
                LanguageManager.changeLanguage(lang);
            }
        });
    },

    // Update the active state of language buttons
    updateActiveLanguageButton: function(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            const isActive = btnLang === lang;
            
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive.toString());
        });
        
        // Re-render header and footer to update their text
        this.renderHeader();
        this.renderFooter();
        this.updatePageTitle(this.currentPage);
    }
};

// Add error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    App.showError('An unexpected error occurred. Please try again.');
});

// Start the app when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Make App available globally for debugging
window.App = App;