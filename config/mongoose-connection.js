const mongoose = require('mongoose');

mongoose
.connect("mongodb://localhost:27017/vane")
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// mongoose.connection.on('disconnected', () => {
//   console.log('MongoDB disconnected');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB error:', err);
// });

module.exports = mongoose.connection;