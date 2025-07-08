require('dotenv').config()
const app = require('./app')
const mongoose = require('mongoose')
const { startCronJobs, stopCronJobs } = require('./services/cronJobs')

const PORT = process.env.PORT || 5000

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB')
  
  // Start cron jobs
  startCronJobs()
  
  // Start server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully')
    stopCronJobs()
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('Server closed')
        process.exit(0)
      })
    })
  })
})
.catch((error) => {
  console.error('MongoDB connection error:', error)
  process.exit(1)
})