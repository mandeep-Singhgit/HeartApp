document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        // If no user is logged in, redirect to the login page
        window.location.href = 'index.html';
        return; // Stop running the rest of the script
    }
    
    const riskForm = document.getElementById('riskForm');
    const riskProfileContent = document.getElementById('risk-profile-content');
    const solutionContent = document.getElementById('solution-content');
    
    let riskProfileChart = null;
    let solutionChart = null;

    riskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            userId,
            age: parseInt(document.getElementById("age").value),
            gender: document.getElementById("gender").value, // Added gender
            systolic: parseInt(document.getElementById("systolic").value),
            diastolic: parseInt(document.getElementById("diastolic").value),
            cholesterol: parseInt(document.getElementById("cholesterol").value),
            glucose: parseInt(document.getElementById("glucose").value),
            smoking: document.getElementById("smoking").value === "yes",
            diabetes: document.getElementById("diabetes").value === "yes",
            exercise: document.getElementById("exercise").value,
            familyHistory: document.getElementById("familyHistory").value === "yes",
        };
        
        let score = 0;
        const riskFactors = [];

        // Risk Factor Calculations
        if (formData.age > 50) score += 2;
        if (formData.gender === "male" && formData.age > 45) score += 1; // Men at higher risk after 45
        if (formData.gender === "female" && formData.age > 55) score += 1; // Women at higher risk after 55 (post-menopause)

        if (formData.systolic > 130 || formData.diastolic > 80) { score += 2; riskFactors.push("High Blood Pressure"); }
        if (formData.cholesterol > 200) { score += 2; riskFactors.push("High Cholesterol"); }
        if (formData.glucose > 100) { score += 1; riskFactors.push("High Glucose"); }
        if (formData.smoking) { score += 3; riskFactors.push("Smoking"); }
        if (formData.diabetes) { score += 3; riskFactors.push("Diabetes"); }
        if (formData.exercise === "light" || formData.exercise === "sedentary") { score += 1; riskFactors.push("Limited Physical Activity"); }
        if (formData.familyHistory) { score += 2; riskFactors.push("Family History"); }
        
        const maxScore = 16; // Adjust based on your scoring logic
        const riskPercentage = Math.min(Math.round((score / maxScore) * 100), 100);

        let riskLevel;
        if (riskPercentage === 0) riskLevel = "Excellent";
        else if (riskPercentage <= 33) riskLevel = "Low";
        else if (riskPercentage <= 66) riskLevel = "Medium";
        else riskLevel = "High";
        
        displayRiskProfile(riskPercentage, riskLevel, riskFactors);
        displaySolutions(riskPercentage);

        try {
            await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, riskPercentage, riskLevel, riskScore: score })
            });
        } catch (error) { console.error('Error saving assessment:', error); }
        
    });

    function displayRiskProfile(percentage, level, factors) {
        riskProfileContent.innerHTML = `
            <div class="chart-container" id="risk-profile-chart-container">
                <div class="chart-text">
                    <div class="chart-text-percent ${level.toLowerCase()}">${percentage}%</div>
                    <div class="chart-text-label">${level} Risk</div>
                </div>
            </div>
            <ul class="risk-factors-list"></ul>
        `;
        const canvas = document.createElement('canvas');
        document.getElementById('risk-profile-chart-container').appendChild(canvas);

        const factorList = riskProfileContent.querySelector('.risk-factors-list');
        if (factors.length > 0) {
            factorList.innerHTML = factors.map(factor => `<li><span>${factor}</span><i class="fa-solid fa-triangle-exclamation"></i></li>`).join('');
        } else {
            factorList.innerHTML = '<li>No major risk factors identified.</li>';
        }

        if (riskProfileChart) riskProfileChart.destroy();
        riskProfileChart = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: { datasets: [{ data: [percentage, 100 - percentage], backgroundColor: ['#ff4757', '#546e7a'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { tooltip: { enabled: false } } }
        });
    }

    function displaySolutions(percentage) {
        let solutionData;
        
        if (percentage === 0) {
            solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-shield-heart', class: 'checkup', title: 'Maintain a Healthy Lifestyle', details: 'Keep up your excellent work with a balanced diet and regular exercise.' },
                    { icon: 'fa-solid fa-stethoscope', class: 'exercise', title: 'Consult Your Doctor Regularly', details: 'Continue with your regular annual check-ups to stay proactive.' }
                ],
                chartData: [50, 50],
                chartLabels: ['Healthy Life', 'Medical Check-ups']
            };
        } else if (percentage <= 20) {
            solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-stethoscope', class: 'checkup', title: 'Consult Your Doctor', details: 'Excellent! Continue with routine annual check-ups.' },
                    { icon: 'fa-solid fa-person-walking', class: 'exercise', title: 'Doctor-Approved Activity', details: 'Keep up your great work. Aim for 3-5 active days per week.' },
                    { icon: 'fa-solid fa-apple-whole', class: 'diet', title: 'Adopt a Heart-Healthy Diet', details: 'Your current diet is likely very good. Continue focusing on whole foods.' },
                    { icon: 'fa-solid fa-bed', class: 'sleep', title: 'Sleeping Schedule', details: 'Maintain a consistent 7-9 hours of sleep for optimal health.' },
                    { icon: 'fa-solid fa-brain', class: 'stress', title: 'Stress Management', details: 'Continue with hobbies and relaxation techniques that work for you.' }
                ]
            };
        } else if (percentage <= 40) {
            solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-stethoscope', class: 'checkup', title: 'Consult Your Doctor', details: 'Good results. Discuss maintaining this lifestyle at your next annual check-up.' },
                    { icon: 'fa-solid fa-person-walking', class: 'exercise', title: 'Doctor-Approved Activity', details: 'Aim for 150+ minutes of cardio weekly to maintain your low risk.' },
                    { icon: 'fa-solid fa-apple-whole', class: 'diet', title: 'Adopt a Heart-Healthy Diet', details: 'Ensure your diet is balanced with lean proteins, fruits, and vegetables.' },
                    { icon: 'fa-solid fa-bed', class: 'sleep', title: 'Sleeping Schedule', details: 'A consistent 7-8 hours of sleep is key. Avoid late-night screen time.' },
                    { icon: 'fa-solid fa-brain', class: 'stress', title: 'Stress Management', details: 'Be mindful of stress. Practice relaxation techniques if you feel overwhelmed.' }
                ]
            }
        } else if (percentage <= 60) {
             solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-stethoscope', class: 'checkup', title: 'Consult Your Doctor', details: 'It is advisable to schedule a check-up to discuss these results and preventative steps.' },
                    { icon: 'fa-solid fa-person-walking', class: 'exercise', title: 'Doctor-Approved Activity', details: 'Increase your weekly cardio to 180+ minutes. Add 2 strength training sessions.' },
                    { icon: 'fa-solid fa-apple-whole', class: 'diet', title: 'Adopt a Heart-Healthy Diet', details: 'Begin to actively reduce your intake of sodium and processed sugars. Monitor portion sizes.' },
                    { icon: 'fa-solid fa-bed', class: 'sleep', title: 'Sleeping Schedule', details: 'Prioritize a consistent 8 hours of sleep to help your body manage stress and repair.' },
                    { icon: 'fa-solid fa-brain', class: 'stress', title: 'Stress Management', details: 'Incorporate daily stress-reduction techniques like deep breathing or a 15-minute walk.' }
                ]
            };
        } else if (percentage <= 80) {
            solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-stethoscope', class: 'checkup', title: 'Consult Your Doctor', details: 'Important: Schedule an appointment with your doctor soon to review these results.' },
                    { icon: 'fa-solid fa-person-walking', class: 'exercise', title: 'Doctor-Approved Activity', details: 'Engage in light to moderate exercise like daily walking, only after your doctor approves.' },
                    { icon: 'fa-solid fa-apple-whole', class: 'diet', title: 'Adopt a Heart-Healthy Diet', details: 'Strictly focus on a diet low in saturated fats, cholesterol, and sodium. meat only.' },
                    { icon: 'fa-solid fa-bed', class: 'sleep', title: 'Sleeping Schedule', details: 'Prioritize 8-9 hours of uninterrupted sleep every night to aid in recovery and reduce strain.' },
                    { icon: 'fa-solid fa-brain', class: 'stress', title: 'Stress Management', details: 'Actively practice stress-reduction techniques daily, as stress is now a major factor.' }
                ]
            };
        } else {
            solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-stethoscope', class: 'checkup', title: 'Consult Your Doctor', details: 'Crucial: Schedule an appointment with your doctor as soon as possible for a full evaluation.' },
                    { icon: 'fa-solid fa-person-walking', class: 'exercise', title: 'Doctor-Approved Activity', details: 'Do not start any new exercise plan without explicit approval and guidance from your doctor.' },
                    { icon: 'fa-solid fa-apple-whole', class: 'diet', title: 'Adopt a Heart-Healthy Diet', details: 'Immediate and strict adherence to a heart-healthy diet is critical. Seek nutritional advice.' },
                    { icon: 'fa-solid fa-bed', class: 'sleep', title: 'Sleeping Schedule', details: 'Maximum rest is essential. Aim for 9+ hours of sleep to help your body cope.' },
                    { icon: 'fa-solid fa-brain', class: 'stress', title: 'Stress Management', details: 'Eliminate as many stressors as possible. Professional guidance may be necessary.' }
                ]
            };
        }
        
        if (!solutionData.chartData) {
            solutionData.chartData = [25, 25, 20, 20, 10];
            solutionData.chartLabels = ['Medical', 'Exercise', 'Diet', 'Sleep', 'Stress'];
        }

        const recommendationsHTML = solutionData.recommendations.map(item => `
            <li>
                <span class="icon-circle ${item.class}"><i class="${item.icon}"></i></span>
                <div class="recommendation-text">
                    <strong>${item.title}</strong>
                    <span>${item.details}</span>
                </div>
            </li>
        `).join('');

        solutionContent.innerHTML = `
            <div class="solution-plan">
                <ul>${recommendationsHTML}</ul>
                <div class="solution-chart-container">
                    <canvas id="solutionDoughnutChart"></canvas>
                </div>
            </div>`;
        
        const ctx = document.getElementById('solutionDoughnutChart').getContext('2d');
        if (solutionChart) { solutionChart.destroy(); }
        solutionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: solutionData.chartLabels,
                datasets: [{
                    data: solutionData.chartData,
                    backgroundColor: ['#ff4757', '#5352ed', '#ffa502', '#2ed573', '#9b59b6'],
                    borderColor: 'transparent',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#bdc3c7', padding: 15, font: { size: 12 } } } },
                cutout: '70%'
            }
        });
    }
});