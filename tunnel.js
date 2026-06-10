const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('Starting localtunnel...');
    const tunnel = await localtunnel({ port: 8080 });
    const url = tunnel.url;
    console.log('Tunnel started:', url);
    
    // Write URL directly to a text file (bypasses console buffer)
    fs.writeFileSync(path.join(__dirname, 'tunnel_url.txt'), url);
    
    // Keep the process alive
    setInterval(() => {}, 1000);
  } catch (err) {
    console.error('Tunnel Error:', err);
    fs.writeFileSync(path.join(__dirname, 'tunnel_error.txt'), err.stack || err.message);
  }
})();
