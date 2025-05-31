import timer from 'timers/promises';

import {INVALIDATION_INTERVAL} from '../config';
import * as waiting from '../service/waiting';

async function main() {
    while(true) {
        await waiting.invalidateBulk();
        await timer.setTimeout(INVALIDATION_INTERVAL);
    }
}

void main();
