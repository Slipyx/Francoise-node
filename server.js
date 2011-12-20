/*
** Starting module. Setup bot, add message listener, initialize RSS feeds, and
** create HTTP server.
** Copyright (C) 2011 Josh Koch. See Copyright Notice in LICENSE.txt
*/

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
    var os = require('os');
    if (to.match(/^[#&]/)) { // Don't receive pm's
        if (message === '.stats') { // Get process stats
            client.say(to, '\u00032Uptime\u000f: ' + require('./uptime.js').format(process.uptime()) +
                ' | \u000302Memory\u000f: ' + process.memoryUsage().rss / 1024 / 1024 + ' MiB.');
        } else if (message === '.os') { // Get OS stats
            client.say(to, '\u00032OS\u000f: ' + os.type() + ' ' + os.release() +
                ' | \u00032Uptime\u000f: ' + require('./uptime.js').format(os.uptime()) +
                ' | \u00032Memory\u000f: ' + os.freemem() / 1024 / 1024 + ' MiB / ' +
                os.totalmem() / 1024 / 1024 + ' MiB');
        } else if (message === '.version') { // Get Node versions
            client.say(to, '\u00032Node.js\u000f: ' + process.versions.node +
                ' | \u00032v8\u000f: ' + process.versions.v8 +
                ' | \u00032ares\u000f: ' + process.versions.ares +
                ' | \u00032uv\u000f: ' + process.versions.uv +
                ' | \u00032openssl\u000f: ' + process.versions.openssl);
        } else if (message.toLowerCase() === '.listfeeds') { // List all feed names
            require('./feedCommands.js').listFeeds(client, to);
        } else if (message.toLowerCase().match(/^\.feedinfo\u0020\w{1,}$/)) { // Get config info for specified feed name
            require('./feedCommands.js').feedInfo(client, to, message.substr(10));
        }
    } else if (message.match(/^\u0001PING\u0020\w{1,}\u0001$/)) { // Reply to CTCP PING's
        console.log('PING request from ' + nick);
        client.notice(nick, message);
    } else if (message.match(/^\u0001VERSION\u0001$/)) { // Reply to CTCP VERSION's
        console.log('VERSION request from ' + nick);
        client.notice(nick, '\u0001VERSION Node.js ' + process.version + ' | ' +
            os.type() + ' ' + os.release() + '\u0001');
    }
});

// Check all feeds on start to get newest date
for (i = 0; i < Common.config.feeds.length; i += 1) {
    Common.config.feeds[i].newestDate = 'Mon, 01 Jan 1970 00:00:00 UTC';
    Common.config.feeds[i].firstTime = true;
    var feedParser = require('./feedParser.js');
    feedParser.checkFeed(client, i);
    setInterval(feedParser.checkFeed, Common.config.feeds[i].t * 1000, client, i);
}

// Hello world web server
require('http').createServer(function (request, response) {
    'use strict';
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write('hello, world');
    response.end();
}).listen(80);
