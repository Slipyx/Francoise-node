// RSS PARSING
var Common = require('./common.js');
var parse;
exports.checkFeed = function (cl, f) {
    'use strict';
    console.log('Checking (' + f + ') ' + Common.config.feeds[f].name + '...');
    var request = require('request');
    request = request.defaults({jar: false});
    request(Common.config.feeds[f].url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            parse(cl, f, body);
        }
    });
};
function parse(cl, f, body) {
    'use strict';
    var sax = require('sax'), strict = true,
        parser = sax.parser(strict, {trim: true, normalize: true}),
        inItem = false, inTitle = false, inDate = false,
        i = -1, c = 0, ch = 0;
    Common.config.feeds[f].items = [];
    parser.ontext = function (t) {
        if (inItem && parser.tag) {
            if (parser.tag.name === 'title') {
                Common.config.feeds[f].items[i].title = t;
            } else if (parser.tag.name === 'link' || parser.tag.name === 'id') {
                Common.config.feeds[f].items[i].link = t;
            } else if (parser.tag.name === 'pubDate' || parser.tag.name === 'dc:date' || parser.tag.name === 'updated') {
                Common.config.feeds[f].items[i].date = t;
            }
        }
    };
    parser.oncdata = function (t) {
        if (inItem && inTitle) {
            Common.config.feeds[f].items[i].title = t;
        } else if (inItem && inDate) {
            Common.config.feeds[f].items[i].date = t;
        }
    };
    parser.onopentag = function (node) {
        if (node.name === 'item' || node.name === 'entry') {
            inItem = true; i += 1;
            Common.config.feeds[f].items[i] = {};
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
    parser.write(body).close();
    //console.log(feed.items);
    if (Common.config.feeds[f].firstTime) {
        Common.config.feeds[f].firstTime = false;
    } else {
        for (c = 0; c < 1; c += 1) { //Common.config.feeds[f].items.length; c += 1) {
            for (ch = 0; ch < cl.opt.channels.length; ch += 1) {
                cl.say(cl.opt.channels[ch], '' + Common.config.feeds[f].c + Common.config.feeds[f].name +
                    ': ' + Common.config.feeds[f].items[c].title +
                    ' <15' + Common.config.feeds[f].items[c].link + '>');
            }
        }
    }
}
