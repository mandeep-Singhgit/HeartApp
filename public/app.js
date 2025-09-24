document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = '/';
        return;
    }
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-btn');
    const riskForm = document.getElementById('riskForm');
    let solutionChart = null;
    let latestAssessment = null;

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (targetPage === 'graph') {
                fetchLatestAssessmentAndDrawChart();
            }
        });
    });

    riskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            userId: userId,
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
        let score = 0;
        let riskFactors = [];
        if (formData.age > 50) { score += 2; riskFactors.push("Older age"); }
        if (formData.systolic > 140 || formData.diastolic > 90) { score += 2; riskFactors.push("High blood pressure"); }
        if (formData.cholesterol > 240) { score += 2; riskFactors.push("High cholesterol"); }
        if (formData.glucose > 126) { score += 2; riskFactors.push("High glucose"); }
        if (formData.smoking) { score += 2; riskFactors.push("Smoking"); }
        if (formData.diabetes) { score += 2; riskFactors.push("Diabetes"); }
        if (formData.exercise === "none") { score += 1; riskFactors.push("Lack of exercise"); }
        if (formData.familyHistory) { score += 2; riskFactors.push("Family history"); }
        formData.riskScore = score;
        formData.riskPercentage = Math.min(score * 10, 100);
        displayResults(formData, riskFactors);
        try {
            const response = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Assessment saved successfully!');
                latestAssessment = await response.json();
            } else { console.error('Failed to save assessment.'); }
        } catch (error) { console.error('Error:', error); }
    });

    function displayResults(data, riskFactors) {
        let riskMessage, riskClass, recommendations;
        if (data.riskScore <= 2) {
            riskMessage = "✅ Low Risk"; riskClass = "low";
            recommendations = "Maintain a healthy lifestyle with a balanced diet and regular exercise.";
            data.riskLevel = "Low";
        } else if (data.riskScore <= 5) {
            riskMessage = "⚠️ Medium Risk"; riskClass = "medium";
            recommendations = "Adopt healthier habits, monitor blood pressure and cholesterol, and consult your doctor.";
            data.riskLevel = "Medium";
        } else {
            riskMessage = "❌ High Risk"; riskClass = "high";
            recommendations = "Seek medical guidance. Consider lifestyle changes and active monitoring.";
            data.riskLevel = "High";
        }
        document.getElementById("results").style.display = "block";
        document.getElementById("riskScore").textContent = data.riskPercentage + "%";
        document.getElementById("riskScore").className = "risk-score " + riskClass;
        document.getElementById("riskMessage").textContent = riskMessage;
        document.getElementById("recommendations").textContent = recommendations;
        const riskList = document.getElementById("riskFactors");
        riskList.innerHTML = "";
        riskFactors.forEach(factor => {
            let li = document.createElement("li");
            li.textContent = factor;
            riskList.appendChild(li);
        });
        document.getElementById("results").scrollIntoView({ behavior: 'smooth' });
    }

    async function fetchLatestAssessmentAndDrawChart() {
        if (!latestAssessment) {
            try {
                const response = await fetch(`/api/assessments/${userId}`);
                const allData = await response.json();
                if (allData.length > 0) {
                    latestAssessment = allData[0];
                } else {
                    document.getElementById('solutionList').innerHTML = '<li>No assessment data found. Please complete the form on the Home page first.</li>';
                    return;
                }
            } catch (error) { console.error('Failed to fetch data:', error); return; }
        }
        drawSolutionChart(latestAssessment);
    }
    
    function drawSolutionChart(data) {
        // --- THIS IS THE FIX ---
        const ctx = document.getElementById('solutionChart').getContext('2d'); // Changed 'd' to '2d'
       
        
        const solutionList = document.getElementById('solutionList');
        let chartData, solutionText;
        if (data.riskLevel === "Low") {
            chartData = [150, 60, 49, 30, 14];
            solutionText = `<li><strong>Cardio:</strong> Aim for 150 minutes of moderate activity per week.</li><li><strong>Strength Training:</strong> Incorporate 2 sessions (60 min total) per week.</li><li><strong>Sleep:</strong> Ensure 7 hours (49 total) per night.</li><li><strong>Meditation:</strong> Practice mindfulness for 30 minutes weekly.</li><li><strong>Healthy Meals:</strong> Focus on 14 balanced, healthy meals.</li>`;
        } else if (data.riskLevel === "Medium") {
            chartData = [180, 90, 52, 60, 18];
            solutionText = `<li><strong>Cardio:</strong> Increase to 180 minutes of activity per week.</li><li><strong>Strength Training:</strong> Aim for 3 sessions (90 min total) per week.</li><li><strong>Sleep:</strong> Prioritize 7.5 hours (52 total) per night.</li><li><strong>Meditation:</strong> Practice mindfulness for 60 minutes weekly to manage stress.</li><li><strong>Healthy Meals:</strong> Focus on 18 balanced, low-sodium meals.</li>`;
        } else {
            chartData = [200, 120, 56, 90, 21];
            solutionText = `<li><strong>Cardio:</strong> Aim for 200+ minutes of gentle activity per week (consult a doctor).</li><li><strong>Strength Training:</strong> Focus on 3-4 light sessions (120 min total).</li><li><strong>Sleep:</strong> Target 8 hours (56 total) per night for recovery.</li><li><strong>Meditation:</strong> Critical for stress reduction, aim for 90 minutes weekly.</li><li><strong>Healthy Meals:</strong> Strictly follow a heart-healthy diet for all 21 main meals.</li>`;
        }
        solutionList.innerHTML = solutionText;
        if (solutionChart) { solutionChart.destroy(); }
        solutionChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Cardio (mins)', 'Strength (mins)', 'Sleep (hours)', 'Meditation (mins)', 'Healthy Meals'],
                datasets: [{
                    label: 'Your Weekly Health Plan',
                    data: chartData,
                    backgroundColor: 'rgba(217, 83, 79, 0.2)',
                    borderColor: 'rgba(217, 83, 79, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(217, 83, 79, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { angleLines: { display: false }, suggestedMin: 0, pointLabels: { font: { size: 14 } } } },
                plugins: { legend: { position: 'top' } }
            }
        });
    }
});