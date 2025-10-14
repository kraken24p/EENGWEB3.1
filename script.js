// ===========================
// INITIALIZATION & CONFIGURATION
// ===========================

// Wait for DOM to be fully loaded
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
});

// ===========================
// LOADING SCREEN (OPTIMIZED)
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
        if (sideNav.classList.contains('open')) {
            closeNav();
        } else {
            openNav();
        }
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

function hideAdminMenuForNonAdmins() {
    auth.onAuthStateChanged(async (user) => {
        const adminLink = document.querySelector('a[href="admin.html"]');
        const servicesLink = document.querySelector('a[href="#service"]');
        
        if (!adminLink) return;
        
        // Check if on mobile device
        const isMobile = window.innerWidth <= 768;
        
        // Hide services link on mobile
        if (servicesLink && isMobile) {
            servicesLink.parentElement.style.display = 'none';
        }
        
        // Show services on desktop
        if (servicesLink && !isMobile) {
            servicesLink.parentElement.style.display = 'block';
        }
        
        if (!user) {
            // Not logged in - hide admin link
            adminLink.parentElement.style.display = 'none';
            return;
        }

        try {
            // Check if user is admin
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            const userData = userSnapshot.val();

            if (userData && userData.isAdmin) {
                // User is admin - show admin link
                adminLink.parentElement.style.display = 'block';
            } else {
                // Regular user - hide admin link
                adminLink.parentElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            // On error, hide admin link to be safe
            adminLink.parentElement.style.display = 'none';
        }
    });
    
    // Re-check on window resize for services link
    window.addEventListener('resize', () => {
        const servicesLink = document.querySelector('a[href="#service"]');
        const isMobile = window.innerWidth <= 768;
        
        if (servicesLink) {
            servicesLink.parentElement.style.display = isMobile ? 'none' : 'block';
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    hideAdminMenuForNonAdmins();
});

// Also call it after auth state changes
auth.onAuthStateChanged(() => {
    setTimeout(hideAdminMenuForNonAdmins, 500);
});
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
            localStorage.setItem('darkMode', null);
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
                    if (lastScrollPosition > 300) {
                        backToTop.classList.add('visible');
                    } else {
                        backToTop.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
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
    
    document.querySelectorAll('.feature-card').forEach(card => {
        card.classList.add('scale-in');
        observer.observe(card);
    });
    
    document.querySelectorAll('.stat-item').forEach(stat => {
        stat.classList.add('scale-in');
        observer.observe(stat);
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
        });
        
        if (clearGlobalSearch) {
            globalSearch.addEventListener('input', function() {
                clearGlobalSearch.style.display = this.value ? 'flex' : 'none';
            });
            
            clearGlobalSearch.addEventListener('click', () => {
                globalSearch.value = '';
                clearGlobalSearch.style.display = 'none';
                document.querySelectorAll('.course-table tbody tr').forEach(row => {
                    row.style.display = '';
                });
                document.querySelectorAll('.image-gallery figure').forEach(figure => {
                    figure.style.display = '';
                });
                globalSearch.focus();
            });
        }
    }
}
// ===========================
// FAVORITES SYSTEM (FIREBASE INTEGRATED) - FIXED
// ===========================
function initFavorites() {
    let favorites = [];

    // Load favorites from Firebase
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
            if (favorites.includes(course)) {
                btn.classList.add('favorited');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-heart-o');
                    icon.classList.add('fa-heart');
                }
            } else {
                btn.classList.remove('favorited');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-heart');
                    icon.classList.add('fa-heart-o');
                }
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
            
            // Disable button during operation
            this.disabled = true;
            
            try {
                if (favorites.includes(course)) {
                    // Remove from favorites
                    favorites = favorites.filter(fav => fav !== course);
                    this.classList.remove('favorited');
                    if (icon) {
                        icon.classList.remove('fa-heart');
                        icon.classList.add('fa-heart-o');
                    }
                    showNotification(`${course} removed from favorites`);
                } else {
                    // Add to favorites
                    favorites.push(course);
                    this.classList.add('favorited');
                    if (icon) {
                        icon.classList.remove('fa-heart-o');
                        icon.classList.add('fa-heart');
                    }
                    showNotification(`${course} added to favorites`);
                }
                
                // Save to Firebase
                await database.ref('users/' + user.uid + '/favorites').set(favorites);
                
            } catch (error) {
                console.error('Error updating favorites:', error);
                showNotification('Failed to update favorites: ' + error.message);
                
                // Revert UI changes on error
                updateFavoriteButtons();
            } finally {
                // Re-enable button
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
            
            if (loadMoreBtn) {
                const visibleBooks = Array.from(books).filter(b => !b.classList.contains('hidden'));
                loadMoreBtn.style.display = visibleBooks.length > 6 ? 'inline-flex' : 'none';
            }
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
        
        // FIX: Use requestAnimationFrame for smoother rendering on mobile
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
            const shouldShow = matchesText && matchesCategory;
            book.classList.toggle('hidden', !shouldShow);
        });
        
        if (searchTerm.length > 0) {
            ensureLibraryOpen();
        }
        
        resetPagination();
        applyPagination();
        updateCounts();
    }

    bookSearch.addEventListener('focus', ensureLibraryOpen);
    bookSearch.addEventListener('input', filterBooks);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            if (!filter) return;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            books.forEach(book => {
                if (filter === 'all') {
                    book.classList.remove('hidden');
                } else {
                    const category = book.getAttribute('data-category');
                    book.classList.toggle('hidden', category !== filter);
                }
            });

            ensureLibraryOpen();
            resetPagination();
            applyPagination();
            updateCounts();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const previousCount = visibleCount;
            visibleCount = 999;
            
            // FIX: Smooth reveal with staggered animation on mobile
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Reveal books gradually for better mobile performance
                const candidates = Array.from(books).filter(b => !b.classList.contains('hidden'));
                candidates.forEach((book, index) => {
                    if (index >= previousCount) {
                        setTimeout(() => {
                            book.classList.remove('hidden-hard');
                        }, (index - previousCount) * 50); // 50ms delay between each
                    }
                });
                
                setTimeout(() => {
                    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                }, (candidates.length - previousCount) * 50);
            } else {
                // Desktop: instant reveal
                applyPagination();
            }
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
                // FIX: Add smooth opening with scroll prevention
                libraryGallery.classList.remove('collapsed');
                libraryGallery.classList.add('expanded');
                toggleLibraryBtn.setAttribute('aria-expanded', 'true');
                toggleLibraryBtn.innerHTML = '<i class="fa fa-eye-slash"></i> Hide Books';
                visibleCount = 6;
                
                // FIX: Use setTimeout to ensure DOM is ready before pagination
                setTimeout(() => {
                    applyPagination();
                    // Smooth scroll with offset for mobile
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
    const timerStatus = document.getElementById('timerStatus');
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const progressRingBar = document.querySelector('.progress-ring-bar');
    const sessionsDisplay = document.getElementById('sessionsCompleted');
    const totalMinutesDisplay = document.getElementById('totalMinutes');

    if (!timerDisplay || !startBtn) return;

    // Load timer stats from Firebase
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
                
                // Save to Firebase
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
            
            if (timerStatus) {
                if (minutes >= 20) {
                    timerStatus.textContent = 'Focus Time';
                } else {
                    timerStatus.textContent = 'Break Time';
                }
            }
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
 // ENHANCED DOWNLOAD TRACKING SYSTEM
// Replace the initDownloadTracking() function in script.js with this:

function initDownloadTracking() {
    console.log('🔄 Initializing enhanced download tracking...');
    
    // Find ALL download links (Google Drive, PDFs, etc.)
    const downloadLinks = document.querySelectorAll('a[href*="drive.google.com"], a[href*=".pdf"]');
    console.log(`📊 Found ${downloadLinks.length} download links`);
    
    downloadLinks.forEach((link, index) => {
        link.addEventListener('click', async function(e) {
            // Don't prevent default - allow download to proceed
            
            let courseName = 'Unknown Material';
            let courseCode = '';
            
            // METHOD 1: Get from table row (HIGHEST PRIORITY)
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
                        console.log(`✅ Method 1 (Table): ${courseName}`);
                    }
                }
            }
            
            // METHOD 2: Get from figure/book card
            if (courseName === 'Unknown Material') {
                const figure = this.closest('figure');
                if (figure) {
                    const heading = figure.querySelector('figcaption h4');
                    if (heading && heading.textContent.trim()) {
                        courseName = heading.textContent.trim();
                        console.log(`✅ Method 2 (Figure): ${courseName}`);
                    }
                }
            }
            
            // METHOD 3: Get from data attribute
            if (courseName === 'Unknown Material') {
                const parent = this.closest('[data-course]');
                if (parent) {
                    courseName = parent.getAttribute('data-course');
                    console.log(`✅ Method 3 (Data attribute): ${courseName}`);
                }
            }
            
            // METHOD 4: Extract from link text
            if (courseName === 'Unknown Material') {
                const linkText = this.textContent.trim();
                if (linkText && linkText.length > 3 && !linkText.includes('Download')) {
                    courseName = linkText;
                    console.log(`✅ Method 4 (Link text): ${courseName}`);
                }
            }
            
            // METHOD 5: Extract from parent text
            if (courseName === 'Unknown Material') {
                const parentText = this.parentElement?.textContent;
                if (parentText && parentText.length > 5) {
                    courseName = parentText.trim().substring(0, 100);
                    console.log(`✅ Method 5 (Parent text): ${courseName}`);
                }
            }
            
            // Track download if user is logged in
            const user = auth.currentUser;
            if (user) {
                try {
                    // Get user data with timeout protection
                    const userRef = database.ref('users/' + user.uid);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 5000)
                    );
                    
                    const userSnapshot = await Promise.race([
                        userRef.once('value'),
                        timeoutPromise
                    ]);
                    
                    const userData = userSnapshot.val();
                    
                    // Extract user name safely
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
                    
                    // Create download record
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
                    
                    // Save to Firebase (non-blocking)
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
                    // Don't show error to user - allow download to proceed
                }
            } else {
                console.log('⚠️ User not logged in - download not tracked');
                showNotification('📥 Opening material...');
            }
        });
    });
    
    console.log(`✅ Download tracking initialized for ${downloadLinks.length} links`);
}

// HELPER: Show notification
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
// Add this to your script.js file to enhance admin navigation

// ===========================
// ADMIN NAVIGATION ENHANCEMENT
// ===========================

function initAdminNavigation() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) return;

        try {
            // Check if user is admin
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            const userData = userSnapshot.val();

            if (userData && userData.isAdmin) {
                // User is admin - show admin features
                showAdminFeatures();
            } else {
                // Regular user - hide admin features
                hideAdminFeatures();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    });
}

function showAdminFeatures() {
    // Add admin badge to navigation
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

    // Add admin toolbar to page (bottom-left indicator)
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
    // Remove admin badge and analytics link
    const adminBadge = document.getElementById('adminBadge');
    if (adminBadge) adminBadge.remove();

    const analyticsLinks = document.querySelectorAll('a[href="analytics.html"]');
    analyticsLinks.forEach(link => link.parentElement?.remove());

    // Remove admin toolbar
    const toolbar = document.getElementById('adminToolbar');
    if (toolbar) toolbar.remove();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initAdminNavigation();
});

// ===========================
// ADMIN QUICK STATS WIDGET (Optional)
// ===========================

async function showAdminQuickStats() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userSnapshot = await database.ref('users/' + user.uid).once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.isAdmin) return;

        // Load quick stats
        const usersSnapshot = await database.ref('users').once('value');
        const downloadsSnapshot = await database.ref('downloads').once('value');

        const totalUsers = usersSnapshot.numChildren();
        const totalDownloads = downloadsSnapshot.numChildren();

        // Update admin toolbar with stats
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

// Call this after showing admin features
setTimeout(() => {
    showAdminQuickStats();
}, 2000);

// ===========================
// ADMIN NOTIFICATION SYSTEM
// ===========================

async function checkAdminNotifications() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userSnapshot = await database.ref('users/' + user.uid).once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.isAdmin) return;

        // Check for new users in last 24 hours
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const usersSnapshot = await database.ref('users')
            .orderByChild('createdAt')
            .startAt(oneDayAgo)
            .once('value');

        const newUsers = usersSnapshot.numChildren();

        if (newUsers > 0) {
            // Show notification
            setTimeout(() => {
                showNotification(`📢 ${newUsers} new user(s) registered in last 24 hours!`);
            }, 3000);
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

// Check notifications every 5 minutes
setInterval(checkAdminNotifications, 5 * 60 * 1000);
checkAdminNotifications(); // Initial check

console.log('✅ Admin navigation enhancements loaded');