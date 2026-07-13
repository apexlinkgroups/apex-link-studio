const { app, connectDB } = require('../server');

module.exports = async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('API bootstrap failed:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'API bootstrap failed',
    });
  }
};
