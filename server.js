//var startTime = Date.now();
var irc = require('irc');

// Configure the bot here
var client = new irc.Client('irc.freenode.net', 'Francoise', {
    userName: 'ed',
    realName: 'Edward',
    port: 7000,
    debug: false,
    showErrors: true,
    autoRejoin: true,
    autoConnect: true,
    channels: ['#callisto'],
    secure: true,
    selfSigned: false,
    floodProtection: true,
    stripColors: false
});

client.addListener('message', function(nick, to, message) {
    //console.log(nick + ' => ' + to + ': ' + message);
    if(message == '.up') {
        //client.say(to, 'Uptime: ' + (Date.now() - startTime) / 1000 / 60 / 60 + ' hours.');
        client.say(to, 'Uptime: ' + process.uptime() / 60 / 60 + ' hours. | Memory: ' + process.memoryUsage().rss / 1024 / 1024 + ' MiB.');
    }
    /*else if(message == '.check') {
        CheckFeed();
    }*/
});

// RSS PARSING!?
var request = require('request');
request = request.defaults({jar: false});
var rssxml = '';
var feed = {name: 'Reddit', url: 'http://www.reddit.com/.rss', items: []}
function CheckFeed()
{
    request(feed.url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            rssxml = body;
            Parse();
        }
    });
}
function Parse()
{
    var sax = require('sax'), strict = true, parser = sax.parser(strict, {trim: true, normalize: true});
    var inItem = false;
    var i = -1;
    parser.ontext = function(t) {
        if(inItem) {
            if(parser.tag.name == 'title') {
                feed.items[i].title = t;
            }
            else if(parser.tag.name == 'link') {
                feed.items[i].link = t;
            }
            else if(parser.tag.name == 'pubDate') {
                feed.items[i].date = t;
            }
        }
    }
    parser.onopentag = function(node) {
        if(node.name == 'item') {
            inItem = true;
            ++i;
            feed.items[i] = {};
        }
    }
    parser.onclosetag = function(tag) {
        if(tag == 'item') inItem = false;
    }
    parser.write(rssxml).close();
    console.log(feed.items);
    for(c = 0; c < feed.items.length; ++c) {
        for(ch = 0; ch < client.opt.channels.length; ++ch) {
            client.say(client.opt.channels[ch], feed.name + ': ' + feed.items[c].title + ' <' + feed.items[c].link + '>');
        }
    }
}

// Hello world web server
/*var http = require('http');
http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('hello, world\n');
}).listen(8124);*/
