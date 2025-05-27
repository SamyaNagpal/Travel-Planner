require('dotenv').config();

const express = require('express');
const axios = require('axios');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;


const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');




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

app.get('/api/geocode', async (req, res) => {
  const address = req.query.address;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch location data' });
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
  ],
  helplineNo: [
    {
      womenHelp: Number,
      medicalName: String,
      medicalNo: Number
    }
  ]
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const femaleUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emergencyContacts: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true }
    }
  ]
});

// Models
const Destination = mongoose.model('Destination', destinationSchema);
const User = mongoose.model('User', userSchema);
const FemaleUser = mongoose.model('FemaleUser', femaleUserSchema);

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

// Add contact route
app.post('/add-contact', async (req, res) => {
  try {
    const { name, number, relationship, userId } = req.body;
    
    // Find the female user and add the contact
    const femaleUser = await FemaleUser.findById(userId);
    if (!femaleUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    femaleUser.emergencyContacts.push({
      name,
      phone: number,
      relationship
    });

    await femaleUser.save();

    res.json({ success: true, message: 'Contact added successfully', contacts: femaleUser.emergencyContacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get contacts route
app.get('/get-contacts/:userId', async (req, res) => {
  try {
    const femaleUser = await FemaleUser.findById(req.params.userId);
    if (!femaleUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, contacts: femaleUser.emergencyContacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/delete-contact/:contactId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { contactId } = req.params;

    const femaleUser = await FemaleUser.findById(userId);
    if (!femaleUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove the contact
    femaleUser.emergencyContacts = femaleUser.emergencyContacts.filter(
      contact => contact._id.toString() !== contactId
    );

    await femaleUser.save();

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Routes

app.post("/add-contact", async (req, res) => {
  try {
    const { name, number, relationship } = req.body;

    if (!name || !number || !relationship) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await client.connect();
    const db = client.db("travelDB");
    const collection = db.collection("femaleusers");

    await collection.insertOne({
      name,
      number,
      relationship,
      addedAt: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ success: false });
  } finally {
    await client.close();
  }
});

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


/*app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'User not found' });
  }
});




const emergencyContacts = [
  { name: "Mom", phone: "+919876543210" },
  { name: "Friend", phone: "+918765432109" },
];*/



app.post('/api/share-location', (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Invalid location data' });
  }

  // You can log or save this info if needed
  console.log('Received location:', latitude, longitude);

  // Simulate sending to emergency contacts
  return res.status(200).json({ message: 'Location sent to emergency contacts' });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));