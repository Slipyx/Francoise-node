/*
** Formats a time given in seconds to a more readable string resembling the
** Linux 'uptime' utility.
** Copyright (C) 2011-2012 Josh Koch. See Copyright Notice in LICENSE.txt
*/

function hrmin(secs) {
    'use strict';
    var hr = Math.floor(secs / 60 / 60),
        min = Math.floor((secs - (hr * 60 * 60)) / 60);
    return hr + ':' + ([1e15] + min).slice(-2);
}

exports.format = function (upsec) {
    'use strict';
    if (upsec < 60) {
        return '0:00';
    } else if (upsec >= 60 && upsec < 86400) {
        if (upsec > 86340) { upsec = 86340; }
        return hrmin(upsec);
    } else if (upsec >= 86400 && upsec < 172800) {
        return '1 day  ' + hrmin(upsec - 86400);
    } else if (upsec >= 172800) {
        var days = Math.floor(upsec / 86400);
        upsec -= days * 86400;
        return days + ' days  ' + hrmin(upsec);
    }

    return 'WHAT' + upsec;
};
