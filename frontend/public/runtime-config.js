(function () {
  var hostname = window.location.hostname;
  var isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  var isLanAddress = /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
    || /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);

  window.KRUSHIMITRA_CONFIG = {
    apiUrl: isLocalhost
      ? 'http://localhost:8080'
      : isLanAddress
        ? 'http://' + hostname + ':8080'
        : 'https://dep-d04r7hn0lbc73dahkupg.onrender.com'
  };
})();
