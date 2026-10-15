const crypto = require('crypto');

function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateSessionId() {
  const prefix = 'SES';
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}-${randomStr}`;
}

function generateJobNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JOB-${dateStr}-${randomStr}`;
}

function generateTransactionId() {
  return `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

module.exports = {
  generateSecureToken,
  hashToken,
  generateSessionId,
  generateJobNumber,
  generateTransactionId
};
