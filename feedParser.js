/*
** RSS Parsing.
** Copyright (C) 2011-2012 Josh Koch. See Copyright Notice in LICENSE.txt
*/

var Common = require('./common.js');
var util = require('util');
var parse;
exports.checkFeed = function (cl, f) {
    'use strict';
    util.log('Checking (' + f + ') ' + Common.config.feeds[f].name + '...');
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
        i = -1, c = 0, ch = 0, newItems = [], n = 0;
    Common.config.feeds[f].items = [];
    parser.ontext = function (t) {
        if (inItem && parser.tag) {
            if (parser.tag.name === 'title') {
                Common.config.feeds[f].items[i].title = t;
            } else if (parser.tag.name === 'link') {
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
        } else if (inItem && node.name === 'link') {
            Common.config.feeds[f].items[i].link = node.attributes.href;
        }
    };
    parser.onclosetag = function (tag) {
        if (tag === 'item' || tag === 'entry') { inItem = false; }
        if (tag === 'title') { inTitle = false; }
        if (tag === 'pubDate' || tag === 'dc:date') { inDate = false; }
    };
    parser.write(body).close();
    // Done parsing feeds, now see if we have any new ones to post.
    for (c = 0; c < Common.config.feeds[f].items.length; c += 1) {
        // Convert dc:date to pubDate if needed
        if (Common.config.feeds[f].items[c].date.substr(0, 1) === '2') {
            Common.config.feeds[f].items[c].date =
                require('./dateUtils.js').dcToPub(Common.config.feeds[f].items[c].date);
        }
        // If item date is newer than newest date, add to newItems list.
        if (require('./dateUtils.js').dateIsNewer(Common.config.feeds[f].newestDate,
                Common.config.feeds[f].items[c].date)) {
            newItems[n] = Common.config.feeds[f].items[c]; n += 1;
        }
    } c = 0;
    //console.log(feed.items);
    for (c = newItems.length - 1; c >= 0; c -= 1) {
        if (!Common.config.feeds[f].firstTime) {
            for (ch = 0; ch < cl.opt.channels.length; ch += 1) {
                cl.say(cl.opt.channels[ch], '\u0003' + Common.config.feeds[f].c + Common.config.feeds[f].name +
                    '\u000f: ' + newItems[c].title + ' <\u000315' + newItems[c].link + '\u000f>');
            }
        }
        if (require('./dateUtils.js').dateIsNewer(Common.config.feeds[f].newestDate, newItems[c].date)) {
            Common.config.feeds[f].newestDate = newItems[c].date;
        }
    }
    util.log(Common.config.feeds[f].name + ' newest date: ' + Common.config.feeds[f].newestDate);
    Common.config.feeds[f].firstTime = false;
}
