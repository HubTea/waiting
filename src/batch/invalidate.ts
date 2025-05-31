import timer from 'timers/promises';

import {INVALIDATION_INTERVAL} from '../config';
import {invalidate} from '../service/waiting';

async function main() {
    while(true) {
        await invalidate();
        await timer.setTimeout(INVALIDATION_INTERVAL);
    }
}

void main();
