import { DateWithZone } from './datewithzone.js';
import { iter } from './iter/index.js';
import { sort } from './dateutil.js';
export function iterSet(iterResult, _rrule, _exrule, _rdate, _exdate, tzid) {
    const _exdateHash = {};
    const _accept = iterResult.accept;
    function evalExdate(after, before) {
        _exrule.forEach(function (rrule) {
            rrule.between(after, before, true).forEach(function (date) {
                _exdateHash[Number(date)] = true;
            });
        });
    }
    _exdate.forEach(function (date) {
        const zonedDate = new DateWithZone(date, tzid).rezonedDate();
        _exdateHash[Number(zonedDate)] = true;
    });
    iterResult.accept = function (date) {
        const dt = Number(date);
        if (isNaN(dt))
            return _accept.call(this, date);
        if (!_exdateHash[dt]) {
            evalExdate(new Date(dt - 1), new Date(dt + 1));
            if (!_exdateHash[dt]) {
                _exdateHash[dt] = true;
                return _accept.call(this, date);
            }
        }
        return true;
    };
    if (iterResult.method === 'between') {
        evalExdate(iterResult.args.after, iterResult.args.before);
        iterResult.accept = function (date) {
            const dt = Number(date);
            if (!_exdateHash[dt]) {
                _exdateHash[dt] = true;
                return _accept.call(this, date);
            }
            return true;
        };
    }
    for (let i = 0; i < _rdate.length; i++) {
        const zonedDate = new DateWithZone(_rdate[i], tzid).rezonedDate();
        if (!iterResult.accept(new Date(zonedDate.getTime())))
            break;
    }
    _rrule.forEach(function (rrule) {
        iter(iterResult, rrule.options);
    });
    const res = iterResult._result;
    sort(res);
    switch (iterResult.method) {
        case 'all':
        case 'between':
            return res;
        case 'before':
            return ((res.length && res[res.length - 1]) || null);
        case 'after':
        default:
            return ((res.length && res[0]) || null);
    }
}
//# sourceMappingURL=iterset.js.map