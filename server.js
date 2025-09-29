require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

const connectionString = process.env.MONGO_URI;
mongoose.connect(connectionString)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
  .catch(err => console.error("❌ Connection error", err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const assessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    age: Number, gender: String, systolic: Number, diastolic: Number,
    cholesterol: Number, glucose: Number, smoking: Boolean, diabetes: Boolean,
    exercise: String, familyHistory: Boolean, riskScore: Number,
    riskPercentage: Number, riskLevel: String,
    bp_status: String, cholesterol_status: String, glucose_status: String, // NEW FIELDS
    riskFactors: [String], // NEW FIELD
    createdAt: { type: Date, default: Date.now }
});
const Assessment = mongoose.model('assessments', assessmentSchema);

// NEW Function to perform the robust, tiered risk calculation with component status
function calculateRisk(formData) {
    let score = 0;
    const riskFactors = [];
    
    // --- Phase 1: Component Status Determination (Low/Medium/High) ---
    let bp_status = "Low";
    if (formData.systolic >= 120 || formData.diastolic >= 80) {
        bp_status = "Medium"; 
    }
    if (formData.systolic >= 140 || formData.diastolic >= 90) {
        bp_status = "High"; 
    }

    let cholesterol_status = "Low";
    if (formData.cholesterol >= 200) {
        cholesterol_status = "Medium";
    }
    if (formData.cholesterol >= 240) {
        cholesterol_status = "High"; 
    }

    let glucose_status = "Low";
    if (formData.glucose >= 100) {
        glucose_status = "Medium";
    }
    if (formData.glucose >= 126) {
        glucose_status = "High"; 
    }

    // --- Phase 2: Tiered Scoring based on Status and Factors ---

    // 1. Age & Gender Scoring
    if (formData.gender === "male") {
        if (formData.age >= 40) { score += 1; }
        if (formData.age >= 50) { score += 1; riskFactors.push("Male age-related risk"); }
        if (formData.age >= 60) { score += 2; }
    } else if (formData.gender === "female") {
        if (formData.age >= 50) { score += 1; }
        if (formData.age >= 60) { score += 2; riskFactors.push("Female age-related risk"); }
    }
    if (formData.age > 70) { score += 1; }

    // 2. Risk Scoring based on Component Status
    if (bp_status === "High") { 
        score += 4; 
        riskFactors.push(`Blood Pressure (${formData.systolic}/${formData.diastolic}) is High`); 
    } else if (bp_status === "Medium") { 
        score += 2; 
        riskFactors.push(`Blood Pressure (${formData.systolic}/${formData.diastolic}) is Medium`); 
    }

    if (cholesterol_status === "High") { 
        score += 3; 
        riskFactors.push(`Cholesterol (${formData.cholesterol}) is High`); 
    } else if (cholesterol_status === "Medium") { 
        score += 2; 
        riskFactors.push(`Cholesterol (${formData.cholesterol}) is Medium`); 
    }

    if (glucose_status === "High") { 
        score += 3; 
        riskFactors.push(`Glucose (${formData.glucose}) is High`); 
    } else if (glucose_status === "Medium") { 
        score += 1; 
        riskFactors.push(`Glucose (${formData.glucose}) is Medium`); 
    }

    // 3. High-Weight Factors 
    if (formData.smoking) { score += 4; riskFactors.push("Smoking"); }
    if (formData.diabetes) { score += 4; riskFactors.push("Diabetes"); }

    // 4. Lifestyle Factors
    if (formData.exercise === "light" || formData.exercise === "sedentary") { 
        score += 2; riskFactors.push("Limited Physical Activity"); 
    }
    if (formData.familyHistory) { 
        score += 2; riskFactors.push("Family History"); 
    }
    
    // Final Calculation (Dynamic Percentage)
    const maxScore = 28; 
    const riskPercentage = Math.min(Math.round((score / maxScore) * 100), 100);

    let riskLevel;
    if (riskPercentage === 0) riskLevel = "Excellent";
    else if (riskPercentage <= 33) riskLevel = "Low";
    else if (riskPercentage <= 66) riskLevel = "Medium";
    else riskLevel = "High";

    return { 
        ...formData, 
        riskScore: score, 
        riskPercentage, 
        riskLevel,
        bp_status, 
        cholesterol_status, 
        glucose_status,
        riskFactors 
    };
}


app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });
    } catch (error) { res.status(500).json({ message: "Error creating user", error }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) { return res.status(404).json({ message: "User not found" }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ message: "Invalid credentials" }); }
        res.status(200).json({ message: "Login successful!", userId: user._id });
    } catch (error) { res.status(500).json({ message: "Server error", error }); }
});

// MODIFIED: This is your dedicated API endpoint that uses the calculateRisk function.
app.post('/api/assessments', async (req, res) => {
    try {
        // 1. Calculate the full risk profile using the new logic
        const fullAssessmentData = calculateRisk(req.body); 

        // 2. Create and save the new Assessment in MongoDB
        const newAssessment = new Assessment(fullAssessmentData);
        await newAssessment.save();

        // 3. Send back the calculated data (the dynamic API response)
        res.status(201).json(fullAssessmentData);
    } catch (error) { 
        console.error('Error processing and saving assessment', error);
        res.status(500).json({ message: 'Error processing and saving assessment', error }); 
    }
});


app.get('/api/assessments/:userId', async (req, res) => {
    try {
        const assessments = await Assessment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(assessments);
    } catch (error) { res.status(500).json({ message: 'Error fetching assessments' }); }
});

// Serve static files like CSS, JS, and images from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- THIS IS THE FIX ---
// This tells the server to send home.html if someone goes to /home.html
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// This is the main catch-all for the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});