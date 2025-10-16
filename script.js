// ===========================
// INITIALIZATION & CONFIGURATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing...');
    
    // EmailJS Configuration
    if (typeof emailjs !== 'undefined') {
        emailjs.init("0sL-rp7AMREkWKCOj");
        console.log('EmailJS initialized');
    }
    
    // Initialize all features
    initLoadingScreen();
    initNavigation();
    initDarkMode();
    initScrollEffects();
    initAnimations();
    initSearch();
    initFavorites();
    initLibrary();
    initFAQ();
    initForms();
    initTimer();
    initKeyboardShortcuts();
    initDownloadTracking();
    initLogout();
    initUserGreeting();
    initAdminNavigation();
    updateNavigationVisibility();
});

// ===========================
// LOADING SCREEN
// ===========================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }, 300);
}

// ===========================
// USER GREETING
// ===========================
function initUserGreeting() {
    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const userSnapshot = await database.ref('users/' + user.uid).once('value');
                const userData = userSnapshot.val();
                const userName = userData?.name || user.displayName || user.email.split('@')[0];
                
                setTimeout(() => {
                    showNotification(`Welcome back, ${userName}!`);
                }, 1500);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    });
}

// ===========================
// NAVIGATION
// ===========================
function initNavigation() {
    const menuBtn = document.getElementById("menuBtn");
    const sideNav = document.getElementById("sideNav");
    const closeSideNav = document.getElementById("closeSideNav");
    
    if (!menuBtn || !sideNav || !closeSideNav) return;

    function closeNav() {
        sideNav.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    }

    function openNav() {
        sideNav.classList.add('open');
        menuBtn.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
    }

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sideNav.classList.contains('open') ? closeNav() : openNav();
    });

    closeSideNav.addEventListener('click', closeNav);

    document.addEventListener('click', function(event) {
        if (!sideNav.contains(event.target) && !menuBtn.contains(event.target)) {
            closeNav();
        }
    });

    document.querySelectorAll('#sideNav a').forEach(link => {
        link.addEventListener('click', closeNav);
    });
    
    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a');

    function highlightNavigation() {
        const scrollPosition = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);
}

// ===========================
// NAVIGATION VISIBILITY CONTROL
// ===========================
function updateNavigationVisibility() {
    const isMobile = window.innerWidth <= 768;
    
    // Hide Services link on mobile
    const servicesLinks = document.querySelectorAll('a[href="#service"]');
    servicesLinks.forEach(link => {
        if (link && link.parentElement) {
            link.parentElement.style.display = isMobile ? 'none' : 'block';
        }
    });
    
    // Handle Admin link visibility based on user role
    auth.onAuthStateChanged(async (user) => {
        const adminLinks = document.querySelectorAll('a[href="admin.html"]');
        
        if (!user) {
            adminLinks.forEach(link => {
                if (link && link.parentElement) {
                    link.parentElement.style.display = 'none';
                }
            });
            return;
        }

        try {
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            const userData = userSnapshot.val();

            adminLinks.forEach(link => {
                if (link && link.parentElement) {
                    link.parentElement.style.display = (userData && userData.isAdmin) ? 'block' : 'none';
                }
            });
        } catch (error) {
            console.error('Error checking admin status:', error);
            adminLinks.forEach(link => {
                if (link && link.parentElement) {
                    link.parentElement.style.display = 'none';
                }
            });
        }
    });
}

// Update on resize and auth change
window.addEventListener('resize', updateNavigationVisibility);
auth.onAuthStateChanged(() => setTimeout(updateNavigationVisibility, 500));

// ===========================
// DARK MODE
// ===========================
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    if (!darkModeToggle) return;

    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fa fa-sun-o"></i>';
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fa fa-sun-o"></i>';
            showNotification('Dark mode enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fa fa-moon-o"></i>';
            showNotification('Light mode enabled');
        }
    });
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================
function showNotification(message, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ===========================
// SCROLL EFFECTS
// ===========================
function initScrollEffects() {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        let lastScrollPosition = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            lastScrollPosition = window.pageYOffset;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    backToTop.classList.toggle('visible', lastScrollPosition > 300);
                    ticking = false;
                });
                ticking = true;
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(scrolled));
        });
    }
    
    if (typeof SmoothScroll !== 'undefined') {
        new SmoothScroll('a[href*="#"]', {
            speed: 1000,
            speedAsDuration: true
        });
    }
}

// ===========================
// COUNTER ANIMATION FOR STATS
// ===========================
function animateCounter(element, target, duration = 2000) {
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// ===========================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===========================
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target.classList.contains('stat-item')) {
                    const statNumber = entry.target.querySelector('h3');
                    if (statNumber && !statNumber.classList.contains('animated')) {
                        statNumber.classList.add('animated');
                        const target = parseInt(statNumber.getAttribute('data-target'));
                        animateCounter(statNumber, target);
                    }
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('section:not(#banner)').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    document.querySelectorAll('.single-service').forEach((card, index) => {
        card.classList.add(index % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        observer.observe(card);
    });
    
    document.querySelectorAll('.feature-card, .stat-item').forEach(element => {
        element.classList.add('scale-in');
        observer.observe(element);
    });
}

// ===========================
// SEARCH FUNCTIONALITY
// ===========================
function initSearch() {
    const globalSearch = document.getElementById('globalSearch');
    const clearGlobalSearch = document.getElementById('clearGlobalSearch');

    if (globalSearch) {
        globalSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            document.querySelectorAll('.course-table tbody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
            
            document.querySelectorAll('.image-gallery figure').forEach(figure => {
                const text = figure.textContent.toLowerCase();
                figure.style.display = text.includes(searchTerm) ? '' : 'none';
            });
            
            if (clearGlobalSearch) {
                clearGlobalSearch.style.display = this.value ? 'flex' : 'none';
            }
        });
        
        if (clearGlobalSearch) {
            clearGlobalSearch.addEventListener('click', () => {
                globalSearch.value = '';
                clearGlobalSearch.style.display = 'none';
                document.querySelectorAll('.course-table tbody tr, .image-gallery figure').forEach(el => {
                    el.style.display = '';
                });
                globalSearch.focus();
            });
        }
    }
}

// ===========================
// FAVORITES SYSTEM (FIREBASE INTEGRATED)
// ===========================
function initFavorites() {
    let favorites = [];

    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const userSnapshot = await database.ref('users/' + user.uid + '/favorites').once('value');
                const favData = userSnapshot.val();
                favorites = Array.isArray(favData) ? favData : [];
                updateFavoriteButtons();
            } catch (error) {
                console.error('Error loading favorites:', error);
                showNotification('Failed to load favorites');
            }
        }
    });

    function updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const course = btn.getAttribute('data-course');
            const icon = btn.querySelector('i');
            const isFavorited = favorites.includes(course);
            
            btn.classList.toggle('favorited', isFavorited);
            if (icon) {
                icon.className = isFavorited ? 'fa fa-heart' : 'fa fa-heart-o';
            }
        });
    }

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const user = auth.currentUser;
            if (!user) {
                showNotification('Please login to save favorites');
                return;
            }

            const course = this.getAttribute('data-course');
            const icon = this.querySelector('i');
            this.disabled = true;
            
            try {
                if (favorites.includes(course)) {
                    favorites = favorites.filter(fav => fav !== course);
                    this.classList.remove('favorited');
                    if (icon) icon.className = 'fa fa-heart-o';
                    showNotification(`${course} removed from favorites`);
                } else {
                    favorites.push(course);
                    this.classList.add('favorited');
                    if (icon) icon.className = 'fa fa-heart';
                    showNotification(`${course} added to favorites`);
                }
                
                await database.ref('users/' + user.uid + '/favorites').set(favorites);
                
            } catch (error) {
                console.error('Error updating favorites:', error);
                showNotification('Failed to update favorites: ' + error.message);
                updateFavoriteButtons();
            } finally {
                this.disabled = false;
            }
        });
    });
}

// ===========================
// LIBRARY SEARCH AND FILTER
// ===========================
function initLibrary() {
    const bookSearch = document.getElementById('bookSearch');
    const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn');
    const books = document.querySelectorAll('.image-gallery figure');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const toggleLibraryBtn = document.getElementById('toggleLibrary');
    const libraryGallery = document.getElementById('libraryGallery');
    const clearSearch = document.getElementById('clearSearch');
    let visibleCount = 6;

    if (!bookSearch || !libraryGallery) return;

    bookSearch.addEventListener('input', function() {
        if (clearSearch) {
            clearSearch.style.display = this.value ? 'flex' : 'none';
        }
        filterBooks();
    });

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            bookSearch.value = '';
            clearSearch.style.display = 'none';
            filterBooks();
            bookSearch.focus();
        });
    }

    function ensureLibraryOpen() {
        if (toggleLibraryBtn.getAttribute('aria-expanded') !== 'true') {
            libraryGallery.classList.remove('collapsed');
            libraryGallery.classList.add('expanded');
            toggleLibraryBtn.setAttribute('aria-expanded', 'true');
            toggleLibraryBtn.innerHTML = '<i class="fa fa-eye-slash"></i> Hide Books';
            applyPagination();
        }
    }

    function updateCounts() {
        const term = (bookSearch?.value || '').toLowerCase().trim();
        
        filterButtons.forEach(btn => {
            const filter = btn.getAttribute('data-filter');
            if (!filter) return;
            
            const count = Array.from(books).filter(b => {
                const cat = b.getAttribute('data-category');
                const title = b.querySelector('figcaption')?.textContent.toLowerCase() || '';
                const matchText = title.includes(term);
                const matchCategory = filter === 'all' || cat === filter;
                return matchText && matchCategory && !b.classList.contains('hidden-hard');
            }).length;
            
            let badge = btn.querySelector('.count-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'count-badge';
                btn.appendChild(badge);
            }
            badge.textContent = count;
        });
    }

    function applyPagination() {
        const isLibraryOpen = toggleLibraryBtn.getAttribute('aria-expanded') === 'true';
        
        if (!isLibraryOpen) {
            books.forEach(b => b.classList.add('hidden-hard'));
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }
        
        const candidates = Array.from(books).filter(b => !b.classList.contains('hidden'));
        
        requestAnimationFrame(() => {
            candidates.forEach((b, i) => {
                b.classList.toggle('hidden-hard', i >= visibleCount);
            });
            
            if (loadMoreBtn) {
                loadMoreBtn.style.display = candidates.length > visibleCount ? 'inline-flex' : 'none';
            }
        });
    }

    function resetPagination() {
        visibleCount = 6;
    }

    function filterBooks() {
        const searchTerm = bookSearch?.value.toLowerCase().trim() || '';
        const activeFilterBtn = document.querySelector('.filter-buttons .filter-btn.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

        books.forEach(book => {
            const title = book.querySelector('figcaption')?.textContent.toLowerCase() || '';
            const category = book.getAttribute('data-category');
            const matchesText = title.includes(searchTerm);
            const matchesCategory = activeFilter === 'all' || category === activeFilter;
            book.classList.toggle('hidden', !(matchesText && matchesCategory));
        });
        
        if (searchTerm.length > 0) {
            ensureLibraryOpen();
        }
        
        resetPagination();
        applyPagination();
        updateCounts();
    }

    bookSearch.addEventListener('focus', ensureLibraryOpen);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            if (!filter) return;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterBooks();
            ensureLibraryOpen();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount = 999;
            applyPagination();
        });
    }

    if (toggleLibraryBtn) {
        toggleLibraryBtn.addEventListener('click', () => {
            const isExpanded = toggleLibraryBtn.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                libraryGallery.classList.add('collapsed');
                libraryGallery.classList.remove('expanded');
                toggleLibraryBtn.setAttribute('aria-expanded', 'false');
                toggleLibraryBtn.innerHTML = '<i class="fa fa-book"></i> View Books';
                visibleCount = 6;
                applyPagination();
            } else {
                libraryGallery.classList.remove('collapsed');
                libraryGallery.classList.add('expanded');
                toggleLibraryBtn.setAttribute('aria-expanded', 'true');
                toggleLibraryBtn.innerHTML = '<i class="fa fa-eye-slash"></i> Hide Books';
                visibleCount = 6;
                
                setTimeout(() => {
                    applyPagination();
                    const isMobile = window.innerWidth <= 768;
                    const scrollOffset = isMobile ? 100 : 0;
                    const elementPosition = libraryGallery.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ 
                        top: elementPosition - scrollOffset, 
                        behavior: 'smooth' 
                    });
                }, 100);
            }
        });
    }

    updateCounts();
    books.forEach(b => b.classList.add('hidden-hard'));
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
}

// ===========================
// FAQ ACCORDION
// ===========================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        if (otherQuestion) {
                            otherQuestion.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                
                item.classList.toggle('active');
                question.setAttribute('aria-expanded', !isActive);
            });
        }
    });
}

// ===========================
// FORMS
// ===========================
function initForms() {
    const newsletterForm = document.getElementById('newsletterForm');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const button = this.querySelector('button');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Subscribing...';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = '<i class="fa fa-check"></i> Subscribed!';
                button.style.background = '#4CAF50';
                showNotification('Successfully subscribed to newsletter!');
                
                this.reset();
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    button.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const button = this.querySelector('.submit-btn');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
            button.disabled = true;
            
            const formData = {
                from_name: this.querySelector('input[name="from_name"]').value,
                from_email: this.querySelector('input[name="from_email"]').value,
                subject: this.querySelector('input[name="subject"]').value,
                message: this.querySelector('textarea[name="message"]').value,
                to_email: 'lockheedmartins07@gmail.com'
            };
            
            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_bchl1cc', 'template_wgyai8j', formData)
                    .then(function(response) {
                        button.innerHTML = '<i class="fa fa-check"></i> Message Sent!';
                        button.style.background = '#4CAF50';
                        showNotification('Message sent successfully!');
                        contactForm.reset();
                        
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.style.background = '';
                            button.disabled = false;
                        }, 3000);
                    }, function(error) {
                        button.innerHTML = '<i class="fa fa-exclamation-triangle"></i> Error - Try Again';
                        button.style.background = '#e74c3c';
                        showNotification('Failed to send message. Please try again.');
                        
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.style.background = '';
                            button.disabled = false;
                        }, 3000);
                    });
            } else {
                console.error('EmailJS not loaded');
                showNotification('Email service not available');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
    }
}

// ===========================
// POMODORO TIMER (FIREBASE INTEGRATED)
// ===========================
function initTimer() {
    let timerInterval;
    let timeLeft = 25 * 60;
    let isRunning = false;
    let sessionsCompleted = 0;
    let totalMinutes = 0;

    const timerDisplay = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const progressRingBar = document.querySelector('.progress-ring-bar');
    const sessionsDisplay = document.getElementById('sessionsCompleted');
    const totalMinutesDisplay = document.getElementById('totalMinutes');

    if (!timerDisplay || !startBtn) return;

    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const userSnapshot = await database.ref('users/' + user.uid).once('value');
                const userData = userSnapshot.val();
                sessionsCompleted = userData?.sessionsCompleted || 0;
                totalMinutes = userData?.totalMinutes || 0;
                
                if (sessionsDisplay) sessionsDisplay.textContent = sessionsCompleted;
                if (totalMinutesDisplay) totalMinutesDisplay.textContent = totalMinutes;
            } catch (error) {
                console.error('Error loading timer stats:', error);
            }
        }
    });

    async function saveTimerStats() {
        const user = auth.currentUser;
        if (user) {
            try {
                await database.ref('users/' + user.uid).update({
                    sessionsCompleted: sessionsCompleted,
                    totalMinutes: totalMinutes
                });
            } catch (error) {
                console.error('Error saving timer stats:', error);
            }
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const activePreset = document.querySelector('.preset-btn.active');
        if (activePreset && progressRingBar) {
            const totalTime = parseInt(activePreset.getAttribute('data-minutes')) * 60;
            const progress = (timeLeft / totalTime) * 691;
            progressRingBar.style.strokeDashoffset = 691 - progress;
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                pauseTimer();
                showNotification('Timer completed! Great work!');
                
                const activePreset = document.querySelector('.preset-btn.active');
                const minutes = parseInt(activePreset.getAttribute('data-minutes'));
                
                if (minutes >= 20) {
                    sessionsCompleted++;
                    if (sessionsDisplay) sessionsDisplay.textContent = sessionsCompleted;
                }
                
                totalMinutes += minutes;
                if (totalMinutesDisplay) totalMinutesDisplay.textContent = totalMinutes;
                
                saveTimerStats();
                
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Study Timer', {
                        body: 'Your study session is complete!',
                        icon: 'images/technology_18655646.gif'
                    });
                }
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        startBtn.disabled = false;
        clearInterval(timerInterval);
    }

    function resetTimer() {
        pauseTimer();
        const activePreset = document.querySelector('.preset-btn.active');
        if (activePreset) {
            timeLeft = parseInt(activePreset.getAttribute('data-minutes')) * 60;
            updateTimerDisplay();
        }
    }

    startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            presetBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const minutes = parseInt(this.getAttribute('data-minutes'));
            timeLeft = minutes * 60;
            pauseTimer();
            updateTimerDisplay();
        });
    });
    
    updateTimerDisplay();

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ===========================
// KEYBOARD SHORTCUTS
// ===========================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('bookSearch') || document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('bookSearch') || document.getElementById('globalSearch');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.blur();
            }
            
            const sideNav = document.getElementById('sideNav');
            if (sideNav && sideNav.classList.contains('open')) {
                const menuBtn = document.getElementById('menuBtn');
                if (menuBtn) menuBtn.click();
            }
        }
    });
}

// ===========================
// DOWNLOAD TRACKING SYSTEM
// ===========================
function initDownloadTracking() {
    console.log('📄 Initializing download tracking...');
    
    const downloadLinks = document.querySelectorAll('a[href*="drive.google.com"], a[href*=".pdf"]');
    console.log(`📊 Found ${downloadLinks.length} download links`);
    
    downloadLinks.forEach((link) => {
        link.addEventListener('click', async function(e) {
            let courseName = 'Unknown Material';
            let courseCode = '';
            
            // Method 1: Get from table row (highest priority)
            const tableRow = this.closest('tr');
            if (tableRow) {
                const cells = tableRow.querySelectorAll('td');
                if (cells.length >= 2) {
                    const codeCell = cells[0]?.querySelector('strong');
                    const nameCell = cells[1];
                    
                    if (codeCell && nameCell) {
                        courseCode = codeCell.textContent.trim();
                        const courseFull = nameCell.textContent.trim();
                        courseName = `${courseCode} - ${courseFull}`;
                    }
                }
            }
            
            // Method 2: Get from figure/book card
            if (courseName === 'Unknown Material') {
                const figure = this.closest('figure');
                if (figure) {
                    const heading = figure.querySelector('figcaption h4');
                    if (heading && heading.textContent.trim()) {
                        courseName = heading.textContent.trim();
                    }
                }
            }
            
            // Method 3: Get from data attribute
            if (courseName === 'Unknown Material') {
                const parent = this.closest('[data-course]');
                if (parent) {
                    courseName = parent.getAttribute('data-course');
                }
            }
            
            const user = auth.currentUser;
            if (user) {
                try {
                    const userRef = database.ref('users/' + user.uid);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 5000)
                    );
                    
                    const userSnapshot = await Promise.race([
                        userRef.once('value'),
                        timeoutPromise
                    ]);
                    
                    const userData = userSnapshot.val();
                    
                    let userName = 'Unknown User';
                    if (userData) {
                        if (userData.name && userData.name !== 'undefined' && userData.name.trim()) {
                            userName = userData.name;
                        } else if (userData.displayName && userData.displayName !== 'undefined') {
                            userName = userData.displayName;
                        } else if (user.email) {
                            userName = user.email.split('@')[0]
                                .replace(/[._]/g, ' ')
                                .split(' ')
                                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ');
                        }
                    }
                    
                    const downloadData = {
                        userId: user.uid,
                        userEmail: user.email || 'unknown@email.com',
                        userName: userName,
                        courseName: courseName,
                        courseCode: courseCode || 'N/A',
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                        url: this.href,
                        method: 'click'
                    };
                    
                    const downloadRef = database.ref('downloads').push();
                    await downloadRef.set(downloadData);
                    
                    console.log('✅ Download tracked:', {
                        user: userName,
                        course: courseName,
                        time: new Date().toLocaleString()
                    });
                    
                    showNotification(`📥 Opening: ${courseName}`);
                    
                } catch (error) {
                    console.error('❌ Download tracking failed:', error);
                }
            } else {
                showNotification('📥 Opening material...');
            }
        });
    });
    
    console.log(`✅ Download tracking initialized for ${downloadLinks.length} links`);
}

// ===========================
// LOGOUT FUNCTIONALITY
// ===========================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await auth.signOut();
                    showNotification('Logged out successfully!');
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                } catch (error) {
                    console.error('Logout error:', error);
                    showNotification('Logout failed. Please try again.');
                }
            }
        });
    }
}

// ===========================
// ADMIN NAVIGATION
// ===========================
function initAdminNavigation() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) return;

        try {
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            const userData = userSnapshot.val();

            if (userData && userData.isAdmin) {
                showAdminFeatures();
                setTimeout(showAdminQuickStats, 1000);
            } else {
                hideAdminFeatures();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    });
}

function showAdminFeatures() {
    const sideNav = document.getElementById('sideNav');
    if (sideNav && !document.getElementById('adminBadge')) {
        const adminLi = sideNav.querySelector('a[href="admin.html"]')?.parentElement;
        if (adminLi) {
            const badge = document.createElement('span');
            badge.id = 'adminBadge';
            badge.style.cssText = `
                background: #FF9800;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                margin-left: 8px;
                font-weight: bold;
            `;
            badge.textContent = 'ADMIN';
            adminLi.querySelector('a').appendChild(badge);
        }
    }

    if (!document.getElementById('adminToolbar')) {
        const toolbar = document.createElement('div');
        toolbar.id = 'adminToolbar';
        toolbar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            z-index: 999;
            display: flex;
            gap: 10px;
            align-items: center;
            font-size: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        toolbar.innerHTML = `
            <span>👑 Admin Mode</span>
            <a href="admin.html" style="color: #00b09b; text-decoration: none;">Dashboard</a>
        `;
        document.body.appendChild(toolbar);
    }
}

function hideAdminFeatures() {
    const adminBadge = document.getElementById('adminBadge');
    if (adminBadge) adminBadge.remove();

    const toolbar = document.getElementById('adminToolbar');
    if (toolbar) toolbar.remove();
}

async function showAdminQuickStats() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userSnapshot = await database.ref('users/' + user.uid).once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.isAdmin) return;

        const usersSnapshot = await database.ref('users').once('value');
        const downloadsSnapshot = await database.ref('downloads').once('value');

        const totalUsers = usersSnapshot.numChildren();
        const totalDownloads = downloadsSnapshot.numChildren();

        const toolbar = document.getElementById('adminToolbar');
        if (toolbar) {
            const statsSpan = document.createElement('span');
            statsSpan.style.cssText = 'color: #ccc; font-size: 11px; margin-left: 10px;';
            statsSpan.textContent = `👥 ${totalUsers} | 📥 ${totalDownloads}`;
            toolbar.appendChild(statsSpan);
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// ===========================
// ERROR HANDLING
// ===========================
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('Something went wrong. Please refresh the page.', 5000);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('An error occurred. Please try again.', 5000);
});

console.log('✅ EENG Website Initialized Successfully!');