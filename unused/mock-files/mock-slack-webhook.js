const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// Mock Slack webhook endpoint
app.post('/webhook/slack', (req, res) => {
  console.log('\n🚨 SLACK ALERT RECEIVED:');
  console.log('='.repeat(50));
  console.log('📅 Time:', new Date().toISOString());
  console.log('📦 Container:', req.body.container || 'Unknown');
  console.log('⚠️  Status:', req.body.status || 'Unknown');
  console.log('🔍 Issue:', req.body.issue || 'Unknown');
  console.log('📝 Message:', req.body.text || req.body.message || 'No message');
  console.log('='.repeat(50));
  
  // Simulate Slack response
  res.json({
    ok: true,
    message: 'Alert sent to #alerts channel',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Mock Slack webhook is running!' });
});

app.listen(port, () => {
  console.log(`🔔 Mock Slack webhook running at http://localhost:${port}`);
  console.log(`📡 Webhook URL: http://localhost:${port}/webhook/slack`);
  console.log('Ready to receive container alerts!');
});