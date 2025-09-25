document.addEventListener('DOMContentLoaded', () => {
    // Page Sections
    const loginPage = document.getElementById('login');
    const registerPage = document.getElementById('register');
    const homePage = document.getElementById('home');
    const graphPage = document.getElementById('graph');
    const allPages = document.querySelectorAll('.page');

    // Navigation & Header Elements
    const mainNav = document.querySelector('.main-nav');
    const navButtons = document.querySelectorAll('.nav-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Auth Forms & Links
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Risk Form & Results
    const riskForm = document.getElementById('riskForm');
    const resultsSection = document.getElementById('results');
    const riskScoreDisplay = document.getElementById('riskScore');
    const riskMessageDisplay = document.getElementById('riskMessage');
    const riskFactorsList = document.getElementById('riskFactors');
    const recommendationsText = document.getElementById('recommendations');
    
    // Graph Elements
    const solutionChartCanvas = document.getElementById('solutionChart');
    const solutionList = document.getElementById('solutionList');
    let solutionChart = null;
    
    let currentUserId = null;
    let latestAssessment = null;

    // --- INITIAL UI SETUP ---
    const checkLoginStatus = () => {
        currentUserId = localStorage.getItem('userId');
        if (currentUserId) {
            // User is logged in
            showPage('home');
            mainNav.style.display = 'flex';
            logoutBtn.style.display = 'block';
        } else {
            // User is not logged in
            showPage('login');
            mainNav.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    };

    // --- PAGE NAVIGATION LOGIC ---
    const showPage = (pageId) => {
        allPages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        
        if (pageId === 'home' || pageId === 'graph') {
            navButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.page === pageId);
            });
        }
    };

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.dataset.page;
            showPage(targetPage);
            if (targetPage === 'graph') {
                setTimeout(fetchLatestAssessmentAndDrawChart, 100);
            }
        });
    });

    // --- AUTHENTICATION LOGIC ---
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showPage('register'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showPage('login'); });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (Your existing registration fetch logic)
        alert('Registration successful! Please log in.');
        showPage('login');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (Your existing login fetch logic)
        const data = { userId: 'mockUserId123' }; // Mock successful login
        localStorage.setItem('userId', data.userId);
        checkLoginStatus();
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('userId');
        currentUserId = null;
        checkLoginStatus();
    });

    // --- RISK FORM LOGIC ---
    riskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // ... (Your existing risk calculation logic)
        
        // Mock data for display
        const riskPercentage = Math.floor(Math.random() * 80) + 10;
        const riskFactors = ["High blood pressure", "Smoking", "Lack of exercise"];
        
        displayResults({ riskPercentage }, riskFactors);
    });

    function displayResults(data, riskFactors) {
        resultsSection.style.display = 'flex';
        riskScoreDisplay.textContent = `${data.riskPercentage}%`;
        
        let riskMessage = "";
        let riskClass = "";

        if (data.riskPercentage < 30) {
            riskMessage = "Low Risk";
            riskClass = "low";
        } else if (data.riskPercentage < 60) {
            riskMessage = "Medium Risk";
            riskClass = "medium";
        } else {
            riskMessage = "High Risk";
            riskClass = "high";
        }
        
        riskMessageDisplay.textContent = riskMessage;
        riskMessageDisplay.className = 'risk-level ' + riskClass;

        riskFactorsList.innerHTML = '';
        riskFactors.forEach(factor => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${factor}`;
            riskFactorsList.appendChild(li);
        });

        recommendationsText.textContent = "Based on your results, we recommend consulting a healthcare professional and adopting a healthier lifestyle.";
    }

    // --- GRAPH LOGIC ---
    function fetchLatestAssessmentAndDrawChart() {
        // Mocking fetched data since there's no backend in this single file version
        latestAssessment = { riskLevel: 'Medium' };
        drawSolutionChart(latestAssessment);
    }
    
    function drawSolutionChart(data) {
        if (!solutionChartCanvas) return;
        const ctx = solutionChartCanvas.getContext('2d');
        let chartData, solutionText;

        if (data.riskLevel === "Low") {
            chartData = [150, 60, 49, 30, 14];
            solutionText = `<li><i class="fas fa-running"></i> <strong>Cardio:</strong> Aim for 150 minutes of moderate activity per week.</li><li><i class="fas fa-dumbbell"></i> <strong>Strength:</strong> Incorporate 2 sessions (60 min total) per week.</li><li><i class="fas fa-bed"></i> <strong>Sleep:</strong> Ensure 7 hours (49 total) per night.</li>`;
        } else if (data.riskLevel === "Medium") {
            chartData = [180, 90, 52, 60, 18];
            solutionText = `<li><i class="fas fa-running"></i> <strong>Cardio:</strong> Increase to 180 minutes of activity per week.</li><li><i class="fas fa-dumbbell"></i> <strong>Strength:</strong> Aim for 3 sessions (90 min total) per week.</li><li><i class="fas fa-bed"></i> <strong>Sleep:</strong> Prioritize 7.5 hours (52 total) per night.</li>`;
        } else {
            chartData = [200, 120, 56, 90, 21];
            solutionText = `<li><i class="fas fa-running"></i> <strong>Cardio:</strong> Aim for 200+ minutes of gentle activity per week (consult a doctor).</li><li><i class="fas fa-dumbbell"></i> <strong>Strength:</strong> Focus on 3-4 light sessions (120 min total).</li><li><i class="fas fa-bed"></i> <strong>Sleep:</strong> Target 8 hours (56 total) per night for recovery.</li>`;
        }
        
        solutionList.innerHTML = solutionText;

        if (solutionChart) {
            solutionChart.destroy();
        }

        solutionChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Cardio (mins)', 'Strength (mins)', 'Sleep (hours)', 'Meditation (mins)', 'Healthy Meals'],
                datasets: [{
                    label: 'Your Weekly Health Plan',
                    data: chartData,
                    backgroundColor: 'rgba(217, 83, 79, 0.2)',
                    borderColor: 'rgba(217, 83, 79, 1)',
                    pointBackgroundColor: 'rgba(217, 83, 79, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(217, 83, 79, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        pointLabels: { font: { size: 12 }, color: var(--text-dark) },
                        ticks: { backdropColor: 'transparent' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: var(--text-dark)
                        }
                    }
                }
            }
        });
    }

    // --- INITIALIZE APP ---
    checkLoginStatus();
});