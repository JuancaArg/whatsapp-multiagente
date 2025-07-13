const fs = require('fs');
const path = require('path');

function saveSession(sessionId, sessionData) {
  const sessionPath = path.join(__dirname, '..', 'sessions', `${sessionId}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify(sessionData));
}

function getSession(sessionId) {
  const sessionPath = path.join(__dirname, '..', 'sessions', `${sessionId}.json`);
  if (fs.existsSync(sessionPath)) {
    const sessionData = fs.readFileSync(sessionPath);
    return JSON.parse(sessionData);
  }
  return null;
}

module.exports = { saveSession, getSession };
