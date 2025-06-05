import { Options, ParsedOptions } from './types.js';
import { Weekday } from './weekday.js';
import { Time } from './datetime.js';
export declare function initializeOptions(options: Partial<Options>): {
    freq?: import("./types.js").Frequency;
    dtstart?: Date | null;
    interval?: number;
    wkst?: Weekday | number | null;
    count?: number | null;
    until?: Date | null;
    tzid?: string | null;
    bysetpos?: number | number[] | null;
    bymonth?: number | number[] | null;
    bymonthday?: number | number[] | null;
    bynmonthday?: number[] | null;
    byyearday?: number | number[] | null;
    byweekno?: number | number[] | null;
    byweekday?: import("./types.js").ByWeekday | import("./types.js").ByWeekday[] | null;
    bynweekday?: number[][] | null;
    byhour?: number | number[] | null;
    byminute?: number | number[] | null;
    bysecond?: number | number[] | null;
    byeaster?: number | null;
};
export declare function parseOptions(options: Partial<Options>): {
    parsedOptions: ParsedOptions;
};
export declare function buildTimeset(opts: ParsedOptions): Time[];
//# sourceMappingURL=parseoptions.d.ts.map