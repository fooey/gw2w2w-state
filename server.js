var express = require('express');
var	http = require('http');
var	app = express();
var	server = http.createServer(app);

// Primus server
var Primus = require('primus.io');
var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });


var chat = primus.channel('chat');
var news = primus.channel('news');

chat.on('connection', function(spark) {
	spark.send('chat', 'welcome to this chat');
});

news.on('connection', function(socket) {
	socket.send('news', { news: 'item' });
});


app.use(express.static(__dirname + '/public'));



server.listen(process.env.PORT || 3000);
