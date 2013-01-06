define('api-client', function() {

  var validResponses = {
    200: true,
    201: true,
    204: true
  };

  var invalidResponses = {
    404: true,
    500: true
  };

  var XMLHttpFactories = [
    function() {
      return new XMLHttpRequest();
    },
    function() {
      return new ActiveXObject('Msxml2.XMLHTTP');
    },
    function() {
      return new ActiveXObject('Msxml3.XMLHTTP');
    },
    function() {
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
  ];

  function createXMLHTTPObject() {
    var xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  function xhr(options) {

    var success = options.success || function() {};
    var error = options.error || function() {};
    var req = createXMLHTTPObject();

    req.open(options.method, options.url, true);

    options.headers = options.headers || {};
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';

    for (var k in options.headers) {
      req.setRequestHeader(k, options.headers[k]);
    }

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      if ((req.status in invalidResponses) && !(req.status in validResponses)) {
        error(null);
        throw new Error('Error loading JSON Data for ' + options.url);
      }

      var response = req.responseText;
      response = JSON.parse(response);
      success(response);
    };

    if (req.readyState === 4) {
      return;
    }

    req.send(options.data || null);
  }

  function get(options) {
    options.method = 'GET';
    xhr(options);
  }

  function create(options) {
    options.method = 'POST';
    options.data = JSON.stringify(options.data || {});
    xhr(options);
  }

  function del(options) {
    options.method = 'DELETE';
    xhr(options);
  }

  function put(options) {
    options.method = 'PUT';
    options.data = JSON.stringify(options.data || {});
    fetch(options);
  }

  return {
    get: get,
    create: create,
    delete: del,
    put: put
  };

});