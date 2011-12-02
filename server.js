var irc = require('irc');
var Common = require('./common.js');
var i = 0;

// Configure the bot
var client = new irc.Client(Common.config.server, Common.config.nick, {
    userName: Common.config.userName,
    realName: Common.config.realName,
    port: Common.config.port,
    debug: false,
    showErrors: true,
    autoRejoin: true,
    autoConnect: true,
    channels: Common.config.channels,
    secure: Common.config.secure,
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
    }
});

// Check all feeds on start to get newest date
for (i = 0; i < Common.config.feeds.length; i += 1) {
    Common.config.feeds[i].newestDate = 'Mon, 01 Jan 1970 00:00:00 UTC';
    Common.config.feeds[i].firstTime = true;
    var feedParser = require('./feedParser.js');
    feedParser.checkFeed(client, i);
    //setInterval(feedParser.checkFeed, Common.config.feeds[i].t * 1000, client, i);
}

// Hello world web server
var http = require('http');
http.createServer(function (request, response) {
    'use strict';
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('hello, world\n');
}).listen(80);
