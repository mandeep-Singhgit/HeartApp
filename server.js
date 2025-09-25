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

// --- THIS IS THE FIX ---
// Added height_ft and weight_kg to the schema
const assessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    age: Number,
    gender: String,
    height_ft: Number,
    weight_kg: Number,
    systolic: Number,
    diastolic: Number,
    cholesterol: Number,
    glucose: Number,
    smoking: Boolean,
    diabetes: Boolean,
    exercise: String,
    familyHistory: Boolean,
    riskScore: Number,
    riskPercentage: Number,
    riskLevel: String,
    createdAt: { type: Date, default: Date.now }
});
const Assessment = mongoose.model('assessments', assessmentSchema);

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

app.post('/api/assessments', async (req, res) => {
    try {
        const newAssessment = new Assessment(req.body);
        await newAssessment.save();
        res.status(201).json(newAssessment);
    } catch (error) { res.status(500).json({ message: 'Error saving assessment', error }); }
});

app.get('/api/assessments/:userId', async (req, res) => {
    try {
        const assessments = await Assessment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(assessments);
    } catch (error) { res.status(500).json({ message: 'Error fetching assessments' }); }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});