const os = require('os');

/**
 * Discovers the host machine's primary non-internal IPv4 address (e.g. 192.168.x.x)
 * so mobile devices on the same local network can connect to the kiosk without relying on localhost.
 */
function getLocalLanIp() {
  const interfaces = os.networkInterfaces();
  
  // Prioritize common wireless/ethernet interface names
  const prioritizedNames = ['Wi-Fi', 'Ethernet', 'wlan0', 'eth0', 'en0'];
  for (const pName of prioritizedNames) {
    if (interfaces[pName]) {
      for (const iface of interfaces[pName]) {
        if (iface.family === 'IPv4' && !iface.internal && iface.address) {
          return iface.address;
        }
      }
    }
  }

  // Fallback to any active non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

module.exports = {
  getLocalLanIp
};
