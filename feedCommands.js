/*
** Commands for getting and setting feed info.
** Copyright (C) 2011 Josh Koch. See Copyright Notice in LICENSE.txt
*/

var Common = require('./common.js');

exports.listFeeds = function (cl, to) {
    'use strict';
    var i = 0, feedList = '';
    for (i = 0; i < Common.config.feeds.length; i += 1) {
        feedList += '\u0003' + Common.config.feeds[i].c + Common.config.feeds[i].name + '\u000f, ';
    }
    feedList = feedList.substring(0, feedList.length - 3);
    cl.say(to, feedList);
};

exports.feedInfo = function (cl, to, feedName) {
    'use strict';
    var i = 0, foundFeed = {};
    for (i = 0; i < Common.config.feeds.length; i += 1) {
        if (Common.config.feeds[i].name === feedName) {
            foundFeed = Common.config.feeds[i];
        }
    }
    if (!foundFeed.name) {
        cl.say(to, 'Feed \'' + feedName + '\' not found.');
    } else {
        cl.say(to, '\u00032Name\u000f: \u0003' + foundFeed.c + foundFeed.name + '\u000f | \u00032URL\u000f: ' +
            foundFeed.url + ' | \u00032Color\u000f: ' + foundFeed.c + ' | \u00032Interval\u000f: ' +
            foundFeed.t);
    }
};
