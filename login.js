document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    });

    // Get all forms and cards
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const forgotPasswordCard = document.getElementById('forgotPasswordCard');
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    // Get all navigation links
    const showSignupLinks = document.querySelectorAll('#showSignup');
    const showLoginLinks = document.querySelectorAll('#showLogin, #backToLogin');
    const showForgotPasswordLinks = document.querySelectorAll('#showForgotPassword');
    
    // Password toggle functionality
   // In login.js, update Google sign-in handler

document.querySelectorAll('.social-btn.google').forEach(button => {
    button.addEventListener('click', async function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Connecting...';
        this.disabled = true;
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            // Extract proper name
            let userName = 'User';
            if (user.displayName && user.displayName.trim()) {
                userName = user.displayName;
            } else if (user.email) {
                userName = user.email.split('@')[0];
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
                userName = userName.replace(/[._]/g, ' ');
            }
            
            // Check if user exists
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            
            if (!userSnapshot.exists()) {
                // New user - save with proper name
                await database.ref('users/' + user.uid).set({
                    name: userName,
                    displayName: user.displayName || userName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    emailVerified: user.emailVerified,
                    isAdmin: false,
                    favorites: [],
                    sessionsCompleted: 0,
                    totalMinutes: 0
                });
            } else {
                // Existing user - update
                const updates = {
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    emailVerified: user.emailVerified
                };
                
                // Fix name if missing
                const userData = userSnapshot.val();
                if (!userData.name || userData.name === 'undefined' || !userData.name.trim()) {
                    updates.name = userName;
                }
                
                await database.ref('users/' + user.uid).update(updates);
            }
            
            showToast('Google sign-in successful!');
            setTimeout(() => window.location.href = 'index.html', 1000);
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.innerHTML = originalText;
            this.disabled = false;
            showToast('Sign-in failed: ' + error.message, 'error');
        }
    });
});
    
    // Navigation between forms
    showSignupLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchCard(loginCard, signupCard);
        });
    });
    
    showLoginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (forgotPasswordCard.style.display !== 'none') {
                switchCard(forgotPasswordCard, loginCard);
            } else {
                switchCard(signupCard, loginCard);
            }
        });
    });
    
    showForgotPasswordLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchCard(loginCard, forgotPasswordCard);
        });
    });
    
    function switchCard(fromCard, toCard) {
        fromCard.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            fromCard.style.display = 'none';
            toCard.style.display = 'block';
            toCard.style.animation = 'slideIn 0.6s ease-out';
        }, 300);
    }
    
    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================
    function validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('one special character');
        }
        
        if (errors.length > 0) {
            return 'Password must contain ' + errors.join(', ');
        }
        
        return null;
    }

    // Real-time password strength indicator
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.style.cssText = 'margin-top: 5px; font-size: 12px; transition: all 0.3s;';
        signupPassword.parentElement.appendChild(strengthIndicator);

        signupPassword.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            let color = '#e74c3c';
            let text = '';

            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

            switch(strength) {
                case 0:
                case 1:
                    color = '#e74c3c';
                    text = 'Weak';
                    break;
                case 2:
                case 3:
                    color = '#f39c12';
                    text = 'Medium';
                    break;
                case 4:
                case 5:
                    color = '#27ae60';
                    text = 'Strong';
                    break;
            }

            strengthIndicator.style.color = color;
            strengthIndicator.textContent = password.length > 0 ? `Password Strength: ${text}` : '';
        });
    }
    
    // ==========================================
    // FIREBASE LOGIN
    // ==========================================
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            const button = this.querySelector('.login-btn');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Signing in...';
            button.disabled = true;
            
            try {
                const persistence = rememberMe 
                    ? firebase.auth.Auth.Persistence.LOCAL 
                    : firebase.auth.Auth.Persistence.SESSION;
                
                await auth.setPersistence(persistence);
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Update last login in Realtime Database
                await database.ref('users/' + user.uid).update({
                    lastLogin: firebase.database.ServerValue.TIMESTAMP
                });
                
                button.innerHTML = '<i class="fa fa-check"></i> Success!';
                button.style.background = '#4CAF50';
                
                showToast('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } catch (error) {
                console.error('Login error:', error);
                button.innerHTML = originalText;
                button.disabled = false;
                
                let errorMessage = 'Login failed. Please try again.';
                
                switch(error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Check your connection.';
                        break;
                }
                
                showToast(errorMessage, 'error');
            }
        });
    }
    
    // ==========================================
    // FIREBASE SIGNUP
    // ==========================================
    // In login.js signup form

if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        
        // Ensure we have a name
        let userName = name;
        if (!userName || userName === '') {
            userName = email.split('@')[0];
            userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            userName = userName.replace(/[._]/g, ' ');
        }
        
        const button = this.querySelector('.login-btn');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Creating account...';
        button.disabled = true;
        
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile
            await user.updateProfile({
                displayName: userName
            });

            // Send verification
            await user.sendEmailVerification();
            
            // Save with proper name
            await database.ref('users/' + user.uid).set({
                name: userName,
                displayName: userName,
                email: email,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                emailVerified: false,
                isAdmin: false,
                favorites: [],
                sessionsCompleted: 0,
                totalMinutes: 0
            });
            
            button.innerHTML = '<i class="fa fa-check"></i> Account Created!';
            button.style.background = '#4CAF50';
            
            showToast('Account created! Please verify your email.', 'success');
            
            setTimeout(() => window.location.href = 'index.html', 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            button.innerHTML = originalText;
            button.disabled = false;
            showToast('Signup failed: ' + error.message, 'error');
        }
    });
}
    
    // ==========================================
    // FIREBASE PASSWORD RESET
    // ==========================================
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value.trim();
            const button = this.querySelector('.login-btn');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
            button.disabled = true;
            
            try {
                await auth.sendPasswordResetEmail(email);
                
                button.innerHTML = '<i class="fa fa-check"></i> Email Sent!';
                button.style.background = '#4CAF50';
                
                showToast('Password reset link sent to your email!', 'success');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    button.disabled = false;
                    document.getElementById('resetEmail').value = '';
                    
                    switchCard(forgotPasswordCard, loginCard);
                }, 2000);
                
            } catch (error) {
                console.error('Password reset error:', error);
                button.innerHTML = originalText;
                button.disabled = false;
                
                let errorMessage = 'Failed to send reset email.';
                
                switch(error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Check your connection.';
                        break;
                }
                
                showToast(errorMessage, 'error');
            }
        });
    }
    
    // ==========================================
    // GOOGLE SIGN-IN
    // ==========================================
    document.querySelectorAll('.social-btn.google').forEach(button => {
        button.addEventListener('click', async function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Connecting...';
            this.disabled = true;
            
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await auth.signInWithPopup(provider);
                const user = result.user;
                
                // Check if user data exists
                const userSnapshot = await database.ref('users/' + user.uid).once('value');
                
                if (!userSnapshot.exists()) {
                    // Create user document for new users
                    await database.ref('users/' + user.uid).set({
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        createdAt: firebase.database.ServerValue.TIMESTAMP,
                        lastLogin: firebase.database.ServerValue.TIMESTAMP,
                        emailVerified: user.emailVerified,
                        isAdmin: false,
                        favorites: [],
                        sessionsCompleted: 0,
                        totalMinutes: 0
                    });
                } else {
                    // Update last login
                    await database.ref('users/' + user.uid).update({
                        lastLogin: firebase.database.ServerValue.TIMESTAMP,
                        emailVerified: user.emailVerified
                    });
                }
                
                showToast('Google sign-in successful!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } catch (error) {
                console.error('Google sign-in error:', error);
                this.innerHTML = originalText;
                this.disabled = false;
                
                let errorMessage = 'Google sign-in failed.';
                
                switch(error.code) {
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'Sign-in cancelled.';
                        break;
                    case 'auth/popup-blocked':
                        errorMessage = 'Popup blocked by browser. Please allow popups.';
                        break;
                    case 'auth/cancelled-popup-request':
                        errorMessage = 'Sign-in cancelled.';
                        break;
                    case 'auth/account-exists-with-different-credential':
                        errorMessage = 'Account exists with different sign-in method.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Check your connection.';
                        break;
                }
                
                showToast(errorMessage, 'error');
            }
        });
    });
    
    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Add CSS animation for slideOut
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-30px);
            }
        }
    `;
    document.head.appendChild(style);
});