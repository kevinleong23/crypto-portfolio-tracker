const cron = require('node-cron')
const { autoSyncAllPortfolios } = require('./syncService')
const Portfolio = require('../models/Portfolio')

// Auto-sync all portfolios every 15 minutes
const autoSyncJob = cron.schedule('*/15 * * * *', async () => {
  console.log('Running auto-sync job...')
  try {
    await autoSyncAllPortfolios()
    console.log('Auto-sync completed')
  } catch (error) {
    console.error('Auto-sync job failed:', error)
  }
}, {
  scheduled: false
})

// Clean up old performance history data (run daily at 2 AM)
const cleanupJob = cron.schedule('0 2 * * *', async () => {
  console.log('Running cleanup job...')
  try {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    // Remove performance history older than 1 year
    await Portfolio.updateMany(
      {},
      {
        $pull: {
          performanceHistory: {
            timestamp: { $lt: oneYearAgo }
          }
        }
      }
    )
    
    console.log('Cleanup completed')
  } catch (error) {
    console.error('Cleanup job failed:', error)
  }
}, {
  scheduled: false
})

// Hourly portfolio snapshot for performance tracking
const snapshotJob = cron.schedule('0 * * * *', async () => {
  console.log('Taking portfolio snapshots...')
  try {
    const portfolios = await Portfolio.find({})
    
    for (const portfolio of portfolios) {
      if (portfolio.totalValue > 0) {
        // Add snapshot to performance history
        portfolio.performanceHistory.push({
          timestamp: new Date(),
          totalValue: portfolio.totalValue
        })
        
        // Keep only last 365 days
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        portfolio.performanceHistory = portfolio.performanceHistory.filter(
          point => point.timestamp > oneYearAgo
        )
        
        await portfolio.save()
      }
    }
    
    console.log('Snapshots completed')
  } catch (error) {
    console.error('Snapshot job failed:', error)
  }
}, {
  scheduled: false
})

// Start all jobs
function startCronJobs() {
  autoSyncJob.start()
  cleanupJob.start()
  snapshotJob.start()
  console.log('Cron jobs started')
}

// Stop all jobs
function stopCronJobs() {
  autoSyncJob.stop()
  cleanupJob.stop()
  snapshotJob.stop()
  console.log('Cron jobs stopped')
}

module.exports = {
  startCronJobs,
  stopCronJobs,
  autoSyncJob,
  cleanupJob,
  snapshotJob
}