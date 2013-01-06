define('api-client', function() {

  var API_BASE = 'http://127.0.0.1:9000/api/';

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

    req.open(options.method, API_BASE + options.url, true);

    options.headers = options.headers || {};
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

  function list(model, options) {
    options.method = 'GET';
    options.url = model;
    xhr(options);
  }

  function get(model, id, options) {
    options.method = 'GET';
    options.url = [model, id].join('/');
    xhr(options);
  }

  function create(model, options) {
    options.method = 'POST';
    options.data = JSON.stringify(options.data || {});
    options.url = model;
    xhr(options);
  }

  function remove(model, id, options) {
    options.method = 'DELETE';
    options.url = [model, id].join('/');
    xhr(options);
  }

  function put(model, id, options) {
    options.method = 'PUT';
    options.data = JSON.stringify(options.data || {});
    options.url = [model, id].join('/');
    xhr(options);
  }

  return {
    list: list,
    get: get,
    create: create,
    remove: remove,
    put: put
  };

});