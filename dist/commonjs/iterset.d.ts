import IterResult from './iterresult.js';
import { RRule } from './rrule.js';
import { QueryMethodTypes, IterResultType } from './types.js';
export declare function iterSet<M extends QueryMethodTypes>(iterResult: IterResult<M>, _rrule: RRule[], _exrule: RRule[], _rdate: Date[], _exdate: Date[], tzid: string | undefined): IterResultType<M>;
//# sourceMappingURL=iterset.d.ts.map