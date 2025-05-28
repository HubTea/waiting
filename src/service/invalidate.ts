import timer from 'timers/promises';
import { Op } from 'sequelize';

import { sequelize } from '../connection';
import { Singleton, SingletonEntity, castSingleton } from '../repository/singleton';
import { Waiting, WaitingEntity, castWaiting } from '../repository/waiting';
import { INVALIDATION_INTERVAL , AUTHORIZATION_REFRESH_TIME} from "../config";

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
    let waitingList: WaitingEntity[] = waitingRecordList.map(x => castWaiting(x));
    
    for(let waiting of waitingList) {
        await sequelize.transaction(async function invalidateWaiting(transaction) {
            let singletonRecord: Singleton | null = await Singleton.findByPk(0, {transaction});
            let singleton: SingletonEntity = castSingleton(singletonRecord!);
            
            await Waiting.update({
                authorized: false,
            }, {
                where: {
                    number: waiting.number,
                },
                transaction,
            });

            let nextWaitingNumber = singleton.lastNumber + 1;
            let nextWaitingRecord: Waiting | null = await Waiting.findByPk(nextWaitingNumber, {transaction});
            if(nextWaitingRecord) {
                let nextWaiting: WaitingEntity = castWaiting(nextWaitingRecord);

                await Waiting.update({
                    authorized: true,
                    expire: new Date(Date.now() + AUTHORIZATION_REFRESH_TIME),
                }, {
                    where: {
                        number: nextWaiting.number,
                    },
                    transaction,
                });

                await Singleton.update({
                    lastNumber: nextWaitingNumber,
                }, {
                    where: {
                        id: 0,
                    },
                    transaction,
                });
            }
            else {
                await Singleton.update({
                    capacity: singleton.capacity + 1,
                }, {
                    where: {
                        id: 0,
                    },
                    transaction,
                });
            }
        });
    }
}

async function main() {
    while(true) {
        await run();
        await timer.setTimeout(INVALIDATION_INTERVAL);
    }
}

main();