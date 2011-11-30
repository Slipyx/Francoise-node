var startTime = Date.now();
var irc = require('irc');

// Configure the bot
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
        client.say(to, 'Uptime: ' + (Date.now() - startTime) / 1000 / 60 / 60 + ' hours.');
    }
    else if(message == '.check') {
        //CheckFeed();
    }
});

// RSS PARSING
var feed = {name: 'XKCD', url: 'http://xkcd.com/rss.xml'}
var rssxml = '';
function CheckFeed()
{
    var request = require('request');
    request = request.defaults({jar: false});
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
    var inTitle = false;
    var inDate = false;
    var i = -1;
    feed.items = [];
    parser.ontext = function(t) {
        if(inItem && parser.tag) {
            if(parser.tag.name == 'title') {
                feed.items[i].title = t;
            }
            else if(parser.tag.name == 'link' || parser.tag.name == 'id') {
                feed.items[i].link = t;
            }
            else if(parser.tag.name == 'pubDate' || parser.tag.name == 'dc:date' || parser.tag.name == 'updated') {
                feed.items[i].date = t;
            }
        }
    }
    parser.oncdata = function(t) {
        if(inItem && inTitle) feed.items[i].title = t;
        else if(inItem && inDate) feed.items[i].date = t;
    }
    parser.onopentag = function(node) {
        if(node.name == 'item' || node.name == 'entry') {
            inItem = true; ++i;
            feed.items[i] = {};
        }
        else if(node.name == 'title') inTitle = true;
        else if(node.name == 'pubDate' || node.name == 'dc:date') inDate = true;
    }
    parser.onclosetag = function(tag) {
        if(tag == 'item' || tag == 'entry') inItem = false;
        if(tag == 'title') inTitle = false;
        if(tag == 'pubDate' || tag == 'dc:date') inDate = false;
    }
    parser.write(rssxml).close();
    //console.log(feed.items);
    for(c = 0; c < feed.items.length; ++c) {
        for(ch = 0; ch < client.opt.channels.length; ++ch) {
            client.say(client.opt.channels[ch], feed.name + ': ' + feed.items[c].title + ' <' + feed.items[c].link + '>');
        }
    }
}

// Hello world web server
var http = require('http');
http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('hello, world\n');
}).listen(80);
