function hrmin(secs)
{
    var hr = Math.floor(secs / 60 / 60);
    var min = Math.floor((secs - (hr * 60 * 60)) / 60);
    return hr + ':' + ([1e15] + min).slice(-2);
}

exports.format = function(upsec)
{
    if(upsec < 60) return '0:00';
    else if(upsec >= 60 && upsec < 86400) {
        if(upsec > 86340) upsec = 86340;
        return hrmin(upsec);
    }
    else if(upsec >= 86400 && upsec < 172800) {
        return '1 day  ' + hrmin(upsec - 86400);
    }
    else if(upsec >= 172800) {
        var days = Math.floor(upsec / 86400);
        upsec -= days * 86400;
        return days + ' days  ' + hrmin(upsec);
    }

    return 'WHAT' + upsec;
}
