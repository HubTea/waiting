import timer from 'timers/promises';
import { Op } from 'sequelize';

import { sequelize } from '../connection';
import { Singleton, SingletonEntity, castSingleton } from '../repository/singleton';
import { Waiting, WaitingEntity, castWaiting } from '../repository/waiting';
import { INVALIDATION_INTERVAL , AUTHORIZATION_REFRESH_TIME} from "../config";
import { retryImmediate } from '../utility';

async function run() {
    let currentTime: Date = new Date();
    let waitingRecordList: Waiting[] = await Waiting.findAll({
        where: {
            expire: {
                [Op.not]: null,
                [Op.lte]: currentTime,
            },
            authorized: true,
        }
    });
    
    for(let waitingRecord of waitingRecordList) {
        await retryImmediate(() => sequelize.transaction(async function invalidateWaiting() {
            let waiting: WaitingEntity = castWaiting(waitingRecord);
            let singletonRecord: Singleton = await Singleton.findByPk(0) as Singleton;
            let singleton: SingletonEntity = castSingleton(singletonRecord);
            
            waiting.authorized = false;
            await waitingRecord.save();

            let nextWaitingNumber = singleton.lastNumber + 1;
            let nextWaitingRecord: Waiting | null = await Waiting.findByPk(nextWaitingNumber);

            if(nextWaitingRecord) {
                let nextWaiting: WaitingEntity = castWaiting(nextWaitingRecord);

                nextWaiting.authorized = true;
                nextWaiting.expire = new Date(Date.now() + AUTHORIZATION_REFRESH_TIME);
                await nextWaitingRecord.save();

                singleton.lastNumber = nextWaitingNumber;
                await singletonRecord.save();
            }
            else {
                singleton.capacity++;
                await singletonRecord.save();
            }
        }));
    }
}

async function main() {
    while(true) {
        await run();
        await timer.setTimeout(INVALIDATION_INTERVAL);
    }
}

main();