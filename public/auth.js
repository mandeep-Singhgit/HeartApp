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

    // Handle login form submission (dummy)
    document.getElementById('login').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Login functionality not implemented in this demo. Redirecting to home.');
        window.location.href = 'home.html';
    });

    // Handle register form submission (dummy)
    document.getElementById('register').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Registration functionality not implemented in this demo. Redirecting to login.');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        // Optionally clear the register form
        this.reset();
    });
});