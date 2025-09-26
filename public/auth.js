document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // --- UPDATED LOGIN LOGIC ---
    const loginHandler = document.getElementById('login');
    loginHandler.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent the form from reloading the page

        // Clear previous error messages
        const existingError = document.getElementById('login-error');
        if (existingError) {
            existingError.remove();
        }

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login was successful
                localStorage.setItem('userId', data.userId); // Store user ID
                window.location.href = 'home.html'; // Redirect to the app
            } else {
                // Login failed, show error message
                const errorElement = document.createElement('p');
                errorElement.id = 'login-error';
                errorElement.textContent = data.message || 'Login failed. Please try again.';
                errorElement.style.color = '#ff4757';
                errorElement.style.marginTop = '15px';
                loginHandler.appendChild(errorElement);
            }
        } catch (error) {
            console.error('Login error:', error);
            // Handle network errors
            const errorElement = document.createElement('p');
            errorElement.id = 'login-error';
            errorElement.textContent = 'A network error occurred. Please try again later.';
            errorElement.style.color = '#ff4757';
            errorElement.style.marginTop = '15px';
            loginHandler.appendChild(errorElement);
        }
    });

    // --- UPDATED REGISTER LOGIC (Optional but recommended) ---
    const registerHandler = document.getElementById('register');
    registerHandler.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('Registration successful! Please log in.');
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
                this.reset();
            } else {
                const data = await response.json();
                alert(`Registration failed: ${data.message}`);
            }
        } catch(error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    });
});