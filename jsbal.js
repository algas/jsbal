var http = require("http");
var EventEmitter = require('events').EventEmitter;

var servers = [
	{'host': 'localhost', 'port': 8887},
	{'host': 'localhost', 'port': 8887}
];

function getServer(servers){
	var index = Math.floor(Math.random() * servers.length);
	// console.log('index: '+index);
	return servers[index];
}

function proxy(server) {
	var ev = new EventEmitter();
	var client = http.createClient(server.port, server.host);
	var request = client.request('GET', '/', {'HOST': server.host});
	request.end();
	request.on('response', function(response){
		var body = "";
		response.on('data', function(chunk){
			body += chunk;
		});
		response.on('end', function(){
			ev.emit('notify', response, body);
		});
	});
	return ev;
}

function onRequest(request, response) {
	// console.log("Request received.");
	var server = getServer(servers);
	var ev = proxy(server);
	ev.on('notify', function(res, body){
		response.writeHead(res.statusCode, res.headers);
		// response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(body);
		response.end();
		console.log("proxy done");
	});
}

var port = 8888;
http.createServer(onRequest).listen(port);

console.log("Server has started.");
