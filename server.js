var WebSocketServer = require('ws').Server,
	http = require('http'),
	express = require('express'),
	app = express();

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	var id = setInterval(function() {
		ws.send(JSON.stringify(process.memoryUsage()), function() { /* ignore errors */ });
	}, 1000);

	console.log('started client interval');

	ws.on('close', function() {
		console.log('stopping client interval');
		clearInterval(id);
	});
});
