import { Op } from 'sequelize';

import { sequelize } from '../connection';
import { Singleton, SingletonEntity, castSingleton } from '../repository/singleton';
import { Waiting, WaitingEntity, castWaiting } from '../repository/waiting';
import { AUTHORIZATION_REFRESH_TIME } from "../config";
import { retryImmediate } from '../utility';

export async function invalidate() {
    const currentTime: Date = new Date();
    const waitingRecordList: Waiting[] = await Waiting.findAll({
        where: {
            expire: {
                [Op.not]: null,
                [Op.lte]: currentTime,
            },
            authorized: true,
        }
    });
    
    for(const waitingRecord of waitingRecordList) {
        await retryImmediate(() => sequelize.transaction(async function invalidateWaiting() {
            const waiting: WaitingEntity = castWaiting(waitingRecord);
            const singletonRecord: Singleton = await Singleton.findByPk(0) as Singleton;
            const singleton: SingletonEntity = castSingleton(singletonRecord);
            
            waiting.authorized = false;
            await waitingRecord.save();

            const nextWaitingNumber = singleton.lastNumber + 1;
            const nextWaitingRecord: Waiting | null = await Waiting.findByPk(nextWaitingNumber);

            if(nextWaitingRecord) {
                const nextWaiting: WaitingEntity = castWaiting(nextWaitingRecord);

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
