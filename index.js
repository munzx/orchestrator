var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var orchestrator = require('./orchestrator')(io);

app.get('/', function(req, res){
    var activeBots = Object.keys(io.sockets.sockets).length;
    var value = (activeBots == 1 || activeBots == 0)? ' ': 's';
    res.status(200).send('Orchestrator is on => ' + activeBots + ' active bot' + value);
});

app.get('/:tag', function(req, res, next){
    var botIDs = Object.keys(io.sockets.sockets);
    if(!req.params.tag){
        res.status(401).send('Tag name was not provieded');
    } else if(botIDs.length === 0){
         res.status(401).send('No bot is connected');
    } else {
        next();
    }
}, orchestrator);

server.listen(3000, function(){
    console.log('Server runs on port 3000');
});