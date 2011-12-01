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

client.addListener('message', function (nick, to, message) {
    'use strict';
    //console.log(nick + ' => ' + to + ': ' + message);
    if (message === '.stats') {
        client.say(to, 'Uptime: ' + require('./uptime.js').format(process.uptime()) + ' | Memory: ' +
            process.memoryUsage().rss / 1024 / 1024 + ' MiB.');
    } else if (message === '.os') {
        var os = require('os');
        client.say(to, 'Uptime: ' + require('./uptime.js').format(os.uptime()) + ' | Memory: ' +
            os.freemem() / 1024 / 1024 + ' MiB / ' + os.totalmem() / 1024 / 1024 +
            ' MiB.');
    } else if (message === '.version') {
        client.say(to, 'Node.js: ' + process.versions.node +
            ' | v8: ' + process.versions.v8 +
            ' | ares: ' + process.versions.ares +
            ' | ev: ' + process.versions.ev +
            ' | openssl: ' + process.versions.openssl);
    } /*else if (message === '.check') {
        checkFeed();
    }*/
});

// RSS PARSING
var feed = {name: 'XKCD', url: 'http://xkcd.com/rss.xml'};
var rssxml = '';
var parse;
function checkFeed() {
    'use strict';
    var request = require('request');
    request = request.defaults({jar: false});
    request(feed.url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            rssxml = body;
            parse();
        }
    });
}
function parse() {
    'use strict';
    var sax = require('sax'), strict = true,
        parser = sax.parser(strict, {trim: true, normalize: true}),
        inItem = false, inTitle = false, inDate = false,
        i = -1, c = 0, ch = 0;
    feed.items = [];
    parser.ontext = function (t) {
        if (inItem && parser.tag) {
            if (parser.tag.name === 'title') {
                feed.items[i].title = t;
            } else if (parser.tag.name === 'link' || parser.tag.name === 'id') {
                feed.items[i].link = t;
            } else if (parser.tag.name === 'pubDate' || parser.tag.name === 'dc:date' || parser.tag.name === 'updated') {
                feed.items[i].date = t;
            }
        }
    };
    parser.oncdata = function (t) {
        if (inItem && inTitle) {
            feed.items[i].title = t;
        } else if (inItem && inDate) {
            feed.items[i].date = t;
        }
    };
    parser.onopentag = function (node) {
        if (node.name === 'item' || node.name === 'entry') {
            inItem = true; i += 1;
            feed.items[i] = {};
        } else if (node.name === 'title') {
            inTitle = true;
        } else if (node.name === 'pubDate' || node.name === 'dc:date') {
            inDate = true;
        }
    };
    parser.onclosetag = function (tag) {
        if (tag === 'item' || tag === 'entry') { inItem = false; }
        if (tag === 'title') { inTitle = false; }
        if (tag === 'pubDate' || tag === 'dc:date') { inDate = false; }
    };
    parser.write(rssxml).close();
    //console.log(feed.items);
    for (c = 0; c < feed.items.length; c += 1) {
        for (ch = 0; ch < client.opt.channels.length; ch += 1) {
            client.say(client.opt.channels[ch], feed.name + ': ' + feed.items[c].title + ' <' + feed.items[c].link + '>');
        }
    }
}

// Hello world web server
var http = require('http');
http.createServer(function (request, response) {
    'use strict';
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('hello, world\n');
}).listen(80);
