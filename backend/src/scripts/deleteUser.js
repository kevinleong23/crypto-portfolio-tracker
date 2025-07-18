require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio'); // Add this line
const Transaction = require('../models/Transaction'); // Add this line

async function deleteUserByEmail(email) {
  if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email "${email}" not found.`);
      return;
    }

    // Delete the user
    await user.deleteOne(); // This will trigger the pre-remove hook
    console.log(`Successfully deleted user with email "${email}" and all associated data.`);

  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Get email from command line arguments
const emailToDelete = process.argv[2];
deleteUserByEmail(emailToDelete);