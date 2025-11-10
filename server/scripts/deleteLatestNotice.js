require('dotenv').config();
const mongoose = require('mongoose');
const Notice = require('../models/Notice');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campushub';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const latest = await Notice.findOne().sort({ createdAt: -1 });
    if (!latest) {
      console.log('No notices found. Nothing to delete.');
      process.exit(0);
    }
    console.log('Latest notice found:');
    console.log('id:', latest._id.toString());
    console.log('title:', latest.title);
    const confirmation = process.env.AUTO_CONFIRM || 'yes';
    if (confirmation.toLowerCase() !== 'yes') {
      console.log('Set AUTO_CONFIRM=yes environment variable to actually delete. Exiting.');
      process.exit(0);
    }
    await Notice.deleteOne({ _id: latest._id });
    console.log('Deleted notice', latest._id.toString());
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

main();
