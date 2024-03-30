const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const homeRouter = require('./home.js');
const Hardware = require('./models/hardware.js');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schema for Arduino data
const arduinoDataSchema = new mongoose.Schema({
  vibrationDuration: Number,
  latitude: Number,
  longitude: Number
});
const ArduinoData = mongoose.model('ArduinoData', arduinoDataSchema);

app.use(bodyParser.json());

// Route to handle Arduino data (POST)
app.post('/data', (req, res) => {
  const { vibrationDuration, latitude, longitude } = req.body;

  const arduinoData = new ArduinoData({
    vibrationDuration,
    latitude,
    longitude
  });

  arduinoData.save()
    .then(() => {
      console.log('Data saved to MongoDB:', arduinoData);
      res.status(200).send('Data saved successfully!');
    })
    .catch(error => {
      console.error('Error saving data to MongoDB:', error);
      res.status(500).send('Failed to save data!');
    });
});

app.post('/register', async (req, res) => {
  const { uniqueId } = req.body; // Extract the uniqueId from the request body

  try {
    // Check if the hardware with the uniqueId already exists
    const existingHardware = await Hardware.findOne({ uniqueId });

    if (existingHardware) {
      return res.status(400).json({ message: 'Hardware already registered' });
    } else {
      // Create a new hardware document
      const newHardware = new Hardware({ uniqueId });
      await newHardware.save();
      return res.status(200).json({ message: 'Hardware registered successfully' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch data from MongoDB (GET)
app.get('/getme', (req, res) => {
  ArduinoData.find()
    .then(data => {
      console.log('Retrieved data from MongoDB:', data);
      res.status(200).json(data);
    })
    .catch(error => {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Failed to fetch data!');
    });
});

// Use the homeRouter for the root route
app.use('/', homeRouter);

app.listen(PORT, () => {
  console.log(`Node.js server listening on port ${PORT}`);
});
