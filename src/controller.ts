import crypto from 'crypto';
import express from 'express';
import zod from 'zod';
import cookieParser from 'cookie-parser';

import { sequelize } from './connection';
import { Waiting, WaitingEntity, createWaiting, castWaiting } from './repository/waiting';
import { Singleton, SingletonEntity, castSingleton } from './repository/singleton';
import { LISTEN_PORT, AUTHORIZATION_REFRESH_TIME, UPSTREAM_URL, STUB_LISTEN_PORT } from './config';
import { retryImmediate } from './utility';

export const app = express();
app.listen(LISTEN_PORT, function (error) {
    if(error) {
        throw error;
    }
    console.log('listening ' + LISTEN_PORT)
});
app.use(cookieParser());
app.use(express.static('./static'));

app.put('/waiting', async function register(request, response) {
    const sessionId: string = crypto.randomUUID();
    let waiting!: WaitingEntity;
    
    await retryImmediate(() => sequelize.transaction(async function registerAndAuthorize() {
        const singletonRecord: Singleton = await Singleton.findByPk(0) as Singleton;
        const singleton: SingletonEntity = castSingleton(singletonRecord);

        let authorized: boolean = false;
        let expire: Date | null = null;
        if(singleton.capacity > 0) {
            authorized = true;
            expire = new Date(Date.now() + AUTHORIZATION_REFRESH_TIME);

            singleton.capacity--;
            singleton.lastNumber = singleton.currentNumber;
            await singletonRecord.save();
        }

        waiting = castWaiting(await createWaiting({
            number: singleton.currentNumber,
            sessionId,
            authorized,
            expire,
        }));

        singleton.currentNumber++;
        await singletonRecord.save();
    }));

    response.cookie('session', waiting.sessionId);
    response.end();
});

app.get('/waiting', async function getWaiting(request, response) {
    let sessionId: string;
    try {
        sessionId = zod.string().parse(request.cookies['session']);
    }
    catch(error) {
        if(!(error instanceof zod.ZodError)) {
            throw error;
        }
        response.status(400);
        response.json({
            error: 'PARAMETER_ERROR',
        });
        return;
    }
    
    const waitingRecord = await Waiting.findOne({
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

    const waiting: WaitingEntity = castWaiting(waitingRecord);
    const singletonRecord: Singleton = await Singleton.findByPk(0) as Singleton;
    const singleton: SingletonEntity = castSingleton(singletonRecord);

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
        if(!(error instanceof zod.ZodError)) {
            throw error;
        }
        response.status(400);
        response.json({
            error: 'PARAMETER_ERROR',
        });
        return;
    }

    const waitingRecord = await Waiting.findOne({
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

    const waiting: WaitingEntity = castWaiting(waitingRecord);
    if(!waiting.authorized) {
        response.status(400);
        response.json({
            error: 'UNAUTHORIZED_REQUEST',
        });
        return;
    }

    await Waiting.update({
        expire: new Date(Date.now() + AUTHORIZATION_REFRESH_TIME),
    }, {
        where: {
            number: waiting.number,
        },
    });

    let body: Buffer | undefined;
    const chunkList: Buffer[] = [];
    if(request.method != 'GET' && request.method != 'HEAD') {
        for await(const chunk of request) {
            chunkList.push(chunk);
        }
        body = Buffer.concat(chunkList);
    }

    const header: Record<string, string> = {};
    for(let i = 0; i < request.rawHeaders.length; i += 2) {
        header[request.rawHeaders[i]] = request.rawHeaders[i + 1];
    }
    
    const upstreamResponse = await fetch(UPSTREAM_URL.origin + request.path, {
        method: request.method,
        headers: new Headers(header),
        body,
    });

    let responseBody: Buffer | undefined;
    const upstreamChunkList: Buffer[] = [];
    if(upstreamResponse.body) {
        for await(const chunk of upstreamResponse.body) {
            upstreamChunkList.push(Buffer.from(chunk));
        }
        responseBody = Buffer.concat(upstreamChunkList);
    }

    const responseHeader: Headers = new Headers(upstreamResponse.headers);
    responseHeader.delete('Content-Encoding');
    
    response.status(upstreamResponse.status);
    response.setHeaders(responseHeader);
    response.end(responseBody);
});

const stub = express();
stub.listen(STUB_LISTEN_PORT, error =>{
    if(error) {
        throw error;
    }
    console.log('stub listening ' + STUB_LISTEN_PORT);
});

stub.get('/{*anyPath}', (request, response) => {
    response.end(JSON.stringify({
        path: request.path,
        header: request.headers,
    }, undefined, 4));
});
