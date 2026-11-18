/**
 * Briefly Backend Server
 * Legal & Medical Document Summarizer
 */

// Load .env configuration natively in Node.js v20+
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch (err) {
    // .env not present or optional, fall back to environment variables
  }
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const GeminiService = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Serve Frontend static assets
const frontendDir = path.join(__dirname, '../../frontend');
app.use(express.static(frontendDir));

// Fallback to frontend index.html for client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  const geminiReady = GeminiService.isAvailable();
  const model = GeminiService.getModel();

  console.log('================================================================');
  console.log('🏛️  Briefly - Legal & Medical Document Summarizer & Verifier');
  console.log('✨ Advancing UN SDG 10 & 16 for Legal & Medical Information Clarity');
  console.log(`🤖 AI Engine: Google Gemini API (${model}) [Free Tier: ${geminiReady ? 'ACTIVE' : 'READY (Key optional)'}]`);
  console.log(`🚀 Server active at: http://localhost:${PORT}`);
  console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`📑 Sample Documents: http://localhost:${PORT}/api/samples`);
  console.log('🛡️  Privacy: Zero retention ephemeral execution active');
  console.log('================================================================');
});

module.exports = app;
