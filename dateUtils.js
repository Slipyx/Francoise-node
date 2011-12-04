var monthNums = {Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12},
    numMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

exports.dcToPub = function (dcdate) {
    'use strict';
    var pdate = require('util').format('Nou, %s %s %s %s',
        dcdate.substr(8, 2), // Day
        numMonths[parseInt(dcdate.substr(5, 2), 10) - 1], // Month
        dcdate.substr(0, 4), // Year
        dcdate.substr(11, 8) // Time
        );
    return pdate;
};

exports.dateIsNewer = function (oldDate, newDate) {
    'use strict';
    var oldTok = {}, newTok = {};

    oldTok.year = parseInt(oldDate.substr(12, 4), 10); // Year
    newTok.year = parseInt(newDate.substr(12, 4), 10);
    oldTok.month = oldDate.substr(8, 3); // Month
    newTok.month = newDate.substr(8, 3);
    oldTok.mday = parseInt(oldDate.substr(5, 2), 10); // Month day
    newTok.mday = parseInt(newDate.substr(5, 2), 10);
    oldTok.hour = parseInt(oldDate.substr(17, 2), 10); // Hours
    newTok.hour = parseInt(newDate.substr(17, 2), 10);
    oldTok.min = parseInt(oldDate.substr(20, 2), 10); // Minutes
    newTok.min = parseInt(newDate.substr(20, 2), 10);
    oldTok.sec = parseInt(oldDate.substr(23, 2), 10); // Seconds
    newTok.sec = parseInt(newDate.substr(23, 2), 10);

    // Do the comparing now
    if (newTok.year > oldTok.year) { // Year is newer
        return true;
    } else if (newTok.year < oldTok.year) { // Year is older
        return false;
    } else if (monthNums[newTok.month] > monthNums[oldTok.month]) { // Month is newer
        return true;
    } else if (monthNums[newTok.month] < monthNums[oldTok.month]) { // Month is older
        return false;
    } else if (newTok.mday > oldTok.mday) { // Month day is newer
        return true;
    } else if (newTok.mday < oldTok.mday) { // Month day is older
        return false;
    } else if (newTok.hour > oldTok.hour) { // Hour is newer
        return true;
    } else if (newTok.hour < oldTok.hour) { // Hour is older
        return false;
    } else if (newTok.min > oldTok.min) { // Minute is newer
        return true;
    } else if (newTok.min < oldTok.min) { // Minute is older
        return false;
    } else if (newTok.sec > oldTok.sec) { // Second is newer
        return true;
    } else if (newTok.sec < oldTok.sec) { // Second is older
        return false;
    }

    return false;
};
