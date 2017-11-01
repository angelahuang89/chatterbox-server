const defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var fs = require('fs');

const messages = [];

var checkForFile = function(fileName, callback) {
  if (fs.existsSync(fileName)) {
    callback();
  } else {
    fs.writeFile(fileName, '[', function(err, data) {
      callback();
    });
  }
};

var requestHandler = function(request, response) {
  let statusCode;
  let headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  
  if (request.url !== '/classes/messages' || request.url === undefined) {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }
  
  if (request.method === 'GET' && request.url === '/classes/messages') {
    statusCode = 200;
    fs.readFile('./savedMessages.txt', 'utf8', (err, messages) => {
      // console.log(messages.split('}'))
      var array = messages.split('}{');
      array[0] = array[0].slice(1);
      array[array.length - 1] = array[array.length - 1].slice(0, -1);
      var mapArray = array.map(message => {
        JSON.parse('{' + message + '}');
      });
      console.log(mapArray)
    });
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results: messages}));
  } 
  
  if (request.method === 'OPTIONS') {
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  }
  
  if (request.method === 'PUT') {
    statusCode = 202;
    response.writeHead(statusCode, headers);
    response.end();
  }
  
  if (request.method === 'POST' && request.url === '/classes/messages') {
    statusCode = 201;
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    });
    request.on('end', () => {
      body = Buffer.concat(body).toString();
      messages.push(JSON.parse(body));
    });
    
    checkForFile('./savedMessages.txt', () => {
      fs.appendFile('./savedMessages.txt', body, (err, data) => {
        if (err) {
          throw  err;
        }
      });
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({results: messages}));
    });
    
  }
};
module.exports = {
  requestHandler: requestHandler
};
