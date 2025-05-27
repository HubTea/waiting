import crypto from 'crypto';
import express from 'express';
import zod from 'zod';
import { Transaction } from 'sequelize';
import cookieParser from 'cookie-parser';

import { sequelize } from './connection';
import { Waiting, WaitingEntity, createWaiting, castWaiting } from './repository/waiting';
import { Singleton, SingletonEntity, castSingleton } from './repository/singleton';
import { LISTEN_PORT, AUTHORIZATION_REFRESH_TIME, UPSTREAM_URL } from './config';

export let app = express();
app.listen(LISTEN_PORT, function (error) {
    if(error) {
        throw error;
    }
    console.log('listening ' + LISTEN_PORT)
});
app.use(cookieParser());

app.put('/waiting', async function register(request, response) {
    let sessionId: string = crypto.randomUUID();
    let waiting: WaitingEntity | undefined;
    
    await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    }, async function registerAndAuthorize(transaction) {
        let singletonRecord: Singleton | null = await Singleton.findByPk(0, {transaction});
        let singleton: SingletonEntity = castSingleton(singletonRecord!);

        let authorized: boolean = false;
        let expire: Date | null = null;
        if(singleton.capacity > 0) {
            authorized = true;
            expire = new Date(Date.now() + AUTHORIZATION_REFRESH_TIME);

            await Singleton.update({
                capacity: singleton.capacity - 1,
            }, {
                where: {
                    id: 0
                },
                transaction,
            });
        }

        await Singleton.update({
            lastNumber: singleton.lastNumber + 1,
        }, {
            where: {
                id: 0,
            },
            transaction,
        });

        waiting = castWaiting(await createWaiting({
            number: singleton.lastNumber + 1,
            sessionId,
            authorized,
            expire,
        }, {
            transaction
        }));
    });

    response.cookie('session', waiting!.sessionId);
    response.end();
});

app.get('/waiting', async function getWaiting(request, response) {
    let sessionId: string;
    try {
        sessionId = zod.string().parse(request.cookies['session']);
    }
    catch(error) {
        response.status(400);
        response.json({
            error: 'PARAMETER_ERROR',
        });
        return;
    }
    
    let waitingRecord = await Waiting.findOne({
        where: {
            sessionId,
        },
    });

    if(!waitingRecord) {
        response.status(400);
        response.json({
            error: 'SESSION_NOT_FOUND',
        });
        return;
    }

    let singletonRecord: Singleton | null = await Singleton.findOne({
        where: {
            id: 0,
        }
    });

    let waiting: WaitingEntity = castWaiting(waitingRecord);
    let singleton: SingletonEntity = castSingleton(singletonRecord!);

    response.json({
        number: waiting.number,
        lastNumber: singleton.lastNumber,
        authorized: waiting.authorized,
    });
});

app.all('/{*anyPath}', async function relay(request, response) {
    let sessionId: string;
    try {
        sessionId = zod.string().parse(request.cookies['session']);
    }
    catch(error) {
        response.status(400);
        response.json({
            error: 'PARAMETER_ERROR',
        });
        return;
    }

    let waitingRecord = await Waiting.findOne({
        where: {
            sessionId,
        },
    });

    if(!waitingRecord) {
        response.status(400);
        response.json({
            error: 'SESSION_NOT_FOUND',
        });
        return;
    }

    let waiting: WaitingEntity = castWaiting(waitingRecord);
    if(!waiting.authorized) {
        response.status(400);
        response.json({
            error: 'UNAUTHORIZED_REQUEST',
        });
        return;
    }

    let body: Buffer | undefined;
    let chunkList: Buffer[] = [];
    if(request.method != 'GET' && request.method != 'HEAD') {
        for await(let chunk of request) {
            chunkList.push(chunk);
        }
        body = Buffer.concat(chunkList);
    }

    let upstreamResponse = await fetch(UPSTREAM_URL, {
        method: request.method,
        headers: request.headers as any,
        body,
    });

    let responseBody: Buffer | undefined;
    let upstreamChunkList: Buffer[] = [];
    if(upstreamResponse.body) {
        for await(let chunk of upstreamResponse.body) {
            upstreamChunkList.push(Buffer.from(chunk));
        }
        responseBody = Buffer.concat(upstreamChunkList);
    }
    
    response.status(upstreamResponse.status);
    response.setHeaders(upstreamResponse.headers);
    response.end(responseBody);
});
