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

    // MODIFIED: This event listener now collects raw data and calls the API
    riskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rawFormData = { // Collect raw data
            userId,
            age: parseInt(document.getElementById("age").value),
            gender: document.getElementById("gender").value,
            systolic: parseInt(document.getElementById("systolic").value),
            diastolic: parseInt(document.getElementById("diastolic").value),
            cholesterol: parseInt(document.getElementById("cholesterol").value),
            glucose: parseInt(document.getElementById("glucose").value),
            smoking: document.getElementById("smoking").value === "yes",
            diabetes: document.getElementById("diabetes").value === "yes",
            exercise: document.getElementById("exercise").value,
            familyHistory: document.getElementById("familyHistory").value === "yes",
        };
        
        try {
            // CALL THE DEDICATED API ENDPOINT
            const response = await fetch('/api/assessments', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rawFormData) 
            });

            const result = await response.json(); // Get the calculated result object

            if (response.ok) {
                // Display results using the dynamic data from the API
                displayRiskProfile(result.riskPercentage, result.riskLevel, result.riskFactors);
                displaySolutions(result); // Pass the entire calculated object for deep personalization
            } else {
                console.error('API Error:', result.message);
            }
        } catch (error) { 
            console.error('Network or Calculation Error:', error); 
        }
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

    // MODIFIED: This function now reads the individual High/Medium/Low statuses for deep personalization
    function displaySolutions(result) { 
        const percentage = result.riskPercentage;
        const factors = result.riskFactors; 
        const bpStatus = result.bp_status; 
        const cholesterolStatus = result.cholesterol_status; 
        const glucoseStatus = result.glucose_status; 

        let solutionData;
        
        // --- General Advice based on Overall Risk Level ---
        if (percentage === 0) {
            solutionData = {
                recommendations: [
                    { icon: 'fa-solid fa-shield-heart', class: 'checkup', title: 'Maintain a Healthy Lifestyle', details: 'Keep up your excellent work with a balanced diet and regular exercise.' },
                    { icon: 'fa-solid fa-stethoscope', class: 'exercise', title: 'Consult Your Doctor Regularly', details: 'Continue with your regular annual check-ups to stay proactive.' }
                ],
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
                    { icon: 'fa-solid fa-apple-whole', class: 'diet', title: 'Adopt a Heart-Healthy Diet', details: 'Strictly focus on a diet low in saturated fats, cholesterol, and sodium. Prioritize lean proteins, vegetables, and whole grains.' },
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

        // --- Personalized Logic using Statuses from API ---
        const factorsMap = new Set(factors); 
        const criticalRecommendations = [];
        
        // 1. Smoking Check (Highest Priority)
        if (factorsMap.has("Smoking")) {
            criticalRecommendations.push({ 
                icon: 'fa-solid fa-ban', class: 'checkup', 
                title: 'IMMEDIATE ACTION: QUIT SMOKING', 
                details: 'Smoking is the single highest modifiable risk. Seek medical and counseling support now.' 
            });
        }

        // 2. Blood Pressure Check
        if (bpStatus === "High") {
            criticalRecommendations.push({ 
                icon: 'fa-solid fa-house-medical-circle-exclamation', class: 'checkup', 
                title: 'URGENT: Consult for Blood Pressure Management', 
                details: `Your BP levels are in the HIGH range. Schedule an immediate consultation for medication and management strategies.` 
            });
        } else if (bpStatus === "Medium" && percentage > 33) {
            criticalRecommendations.push({ 
                icon: 'fa-solid fa-notes-medical', class: 'checkup', 
                title: 'Action Needed: Monitor Blood Pressure', 
                details: `Your BP is in the MEDIUM range. Start regular monitoring and discuss lifestyle changes with your doctor.` 
            });
        }

        // 3. Cholesterol Check
        if (cholesterolStatus === "High" && percentage > 40) {
            criticalRecommendations.push({ 
                icon: 'fa-solid fa-bowl-food', class: 'diet', 
                title: 'PRIORITY: Intensive Diet & Cholesterol Review', 
                details: `Your Cholesterol is HIGH. Focus on a strict, low-fat, high-fiber diet, and follow up with a blood panel.` 
            });
        }
        
        // 4. Glucose/Diabetes Check
        if (glucoseStatus === "High" || factorsMap.has("Diabetes")) {
            criticalRecommendations.push({ 
                icon: 'fa-solid fa-syringe', class: 'checkup', 
                title: 'PRIORITY: Diabetes Control Plan', 
                details: 'Strict glucose monitoring and adherence to your doctor’s diabetes management plan is essential.' 
            });
        }
        
        // Inject the critical, factor-specific recommendations at the start of the list
        if (criticalRecommendations.length > 0) {
            solutionData.recommendations = criticalRecommendations.concat(solutionData.recommendations);
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