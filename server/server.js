const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();



const app = express();



// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For form data


const API_KEY = 'AIzaSyBq8irwRg0ujtyrlPTMbeeNYpVNElIMypI'; // Keep this secret in .env in production
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

let chatSession = null;

// Initialize chat session with system prompt
async function initChat() {
  chatSession = await model.startChat({
    history: [
      {
        role: 'user',
        parts: [{
          text: `You are an expert travel planner specializing in Indian tourism. 
          Your job is to help users plan trips across India with detailed itineraries, 
          suggest best destinations, experiences, places to eat, local travel tips, and budget-friendly options. 
          Always keep recommendations limited to destinations within India. 
          Ask follow-up questions to gather necessary details like trip duration, budget, travel preferences 
          (mountains, beaches, culture, food, etc.), and number of people traveling. 
          Format itineraries day-wise and suggest realistic travel and stay plans. 
          Avoid non-Indian destinations. Be helpful, polite, and culturally aware.`
        }]
      }
    ]
  });
}

initChat();

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!chatSession) {
    await initChat();
  }

  try {
    const result = await chatSession.sendMessage(userMessage);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Sorry, an error occurred. Please try again.' });
  }
});




// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.log('Connection error:', err));

// Schemas
const destinationSchema = new mongoose.Schema({
  name: String,
  location: String,
  image: String, // Image URL of the location
  description: String,
  activities: [
    {
      name: String,
      location: String,
      image: String, // Image URL for the activity
      cost: Number,
      duration: String
    }
  ],
  accommodations: [
    {
      name: String,
      budgetCategory: { type: String, enum: ['low', 'medium', 'high'] },
      estimatedCost: Number
    }
  ],
  foodOptions: [
    {
      name: String,
      budgetCategory: { type: String, enum: ['low', 'medium', 'high'] },
      estimatedCost: Number
    }
  ],
  transportation: [
    {
      mode: String,
      budgetCategory: { type: String, enum: ['low', 'medium', 'high'] },
      estimatedCost: Number
    }
  ]
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

// Models
const Destination = mongoose.model('Destination', destinationSchema);
const User = mongoose.model('User', userSchema);

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Routes



app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.status(201).json({ token });

    console.log('POST /api/register hit');

  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});
app.get('/api/destination/:name', async (req, res) => {
  try {
    const destination = await Destination.findOne({ 
      name: { $regex: new RegExp(req.params.name, 'i') }
    });
    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Protected Routes


app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'User not found' });
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));