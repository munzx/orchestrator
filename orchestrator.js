module.exports = function orchestrator(io){
    var _Bots = {};
    io.on('connect', function(socket){
        console.log('Bot connected');
        _Bots[socket.id] = {};
        _Bots[socket.id].id = socket.id;
        _Bots[socket.id].socket = socket;
        _Bots[socket.id].isActive = false;
        _Bots[socket.id].socket.once('disconnect', function(){
            console.log('Bot disconnected');
            delete _Bots[socket.id];
        });
    });

    return function init(req, res){
        var self = this;
        self.count = 0;
        self.botIDs = Object.keys(io.sockets.sockets);
        
        self.randomBot = function(){
            var randomNumber = Math.floor(Math.random() * self.botIDs.length - 1) + 1;
            return _Bots[self.botIDs[randomNumber]];
        }

        self.botFound = function(bot){
            self.waitForResponse = setTimeout(function(){
                if(bot.isActive){
                    bot.isActive = false;
                    res.status(401).send('Failed to get page content');
                    clearTimeout(self.waitForResponse);
                }
            }, 5000);

            bot.socket.emit('fetch', req.params.tag);
            bot.socket.once('page' , function(content){
                if(bot.isActive){
                    bot.isActive = false;
                    clearTimeout(self.waitForResponse);
                    res.status(200).send(content);
                }
            });
        }

        self.botNotFound = function(){
            console.log('Random Bot Not Found');
            res.status(404).send('Failed to find an inactive bot');
        }

        self.findBotTimeOut = setTimeout(function(){
            self.botNotFound();
        }, 1000);

        while(self.count <= self.botIDs.length){
            var bot = self.randomBot();
            if(bot.isActive === false){
                clearTimeout(self.findBotTimeOut);
                bot.isActive = true;
                self.botFound(bot);
                break;
            }
            self.count++;
        }
    }
}