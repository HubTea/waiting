import crypto from 'crypto';
import express, { Request, Response } from 'express';
import * as yup from 'yup';
import { Controller, Put, Get, All, HttpException, HttpStatus, Req, Res, Headers as NestHeaders, Delete } from '@nestjs/common';

import { sequelize } from './connection';
import { Waiting, WaitingEntity, createWaiting, castWaiting } from './repository/waiting';
import { Singleton, SingletonEntity, castSingleton } from './repository/singleton';
import { AUTHORIZATION_REFRESH_TIME, UPSTREAM_URL, STUB_LISTEN_PORT } from './config';
import { retryImmediate } from './utility';
import * as waitingService from './service/waiting';


const sessionSchema = yup.object({
    sessionId: yup.string().required().uuid(),
});
type SessionDto = yup.InferType<typeof sessionSchema>;

const waitingSchema = yup.object({
    number: yup.number().required().integer(),
    lastNumber: yup.number().required().integer(),
    authorized: yup.boolean().required(),
});
type WaitingDto = yup.InferType<typeof waitingSchema>;

enum ErrorCode {
    PARAMETER_ERROR = 'PARAMETER_ERROR',
    SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
    UNAUTHORIZED_REQUEST = 'UNAUTHORIZED_REQUEST',
}

function parse<T>(fn: () => T): T {
    try {
        return fn();
    }
    catch(error) {
        if(!(error instanceof yup.ValidationError)) {
            throw error;
        }
        throw new HttpException(ErrorCode.PARAMETER_ERROR, HttpStatus.BAD_REQUEST);
    }
}

function respond(response: Response, status: number, body: object) {
    response.status(status);
    response.setHeader('Content-Type', 'application/json');
    response.json(body);
}

function respondBadRequest(response: Response, errorCode: string) {
    respond(response, HttpStatus.BAD_REQUEST, {
        error: errorCode,
    });
}

@Controller()
export class WaitingController {

    @Get('/error')
    async error() {
        throw new Error();
    }
    
    @Put('/waiting')
    async registerWaiting(): Promise<SessionDto> {
        const sessionId: string = crypto.randomUUID();
        
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

            castWaiting(await createWaiting({
                number: singleton.currentNumber,
                sessionId,
                authorized,
                expire,
            }));

            singleton.currentNumber++;
            await singletonRecord.save();
        }));

        return {
            sessionId,
        };
    }

    @Get('/waiting')
    async getWaiting(@NestHeaders('X-WAITING-SESSION') sessionId: string): Promise<WaitingDto> {
        sessionId = parse(() => yup.string().uuid().required().validateSync(sessionId));
        
        const waitingRecord = await Waiting.findOne({
            where: {
                sessionId,
            },
        });

        if(!waitingRecord) {
            throw new HttpException(ErrorCode.SESSION_NOT_FOUND, HttpStatus.BAD_REQUEST);
        }

        const waiting: WaitingEntity = castWaiting(waitingRecord);
        const singletonRecord: Singleton = await Singleton.findByPk(0) as Singleton;
        const singleton: SingletonEntity = castSingleton(singletonRecord);

        return {
            number: waiting.number,
            lastNumber: singleton.lastNumber,
            authorized: waiting.authorized,
        };
    }

    @Delete('/waiting')
    async invalidateWaiting(@NestHeaders('X-WAITING-SESSION') sessionId: string): Promise<void> {
        sessionId = parse(() => yup.string().uuid().required().validateSync(sessionId));

        const waitingRecord = await Waiting.findOne({
            where: {
                sessionId,
            },
        });

        if(!waitingRecord) {
            throw new HttpException(ErrorCode.SESSION_NOT_FOUND, HttpStatus.BAD_REQUEST);
        }

        const waiting: WaitingEntity = castWaiting(waitingRecord);
        await waitingService.invalidate(waiting.number);
    }

    @All('/{*anyPath}')
    async relay(@Req() request: Request, @Res() response: Response) {
        let sessionId: string;
        try {
            sessionId = yup.string().uuid().required().validateSync(request.headers['x-waiting-session']);
        }
        catch(error) {
            if(!(error instanceof yup.ValidationError)) {
                throw error;
            }
            respondBadRequest(response, ErrorCode.PARAMETER_ERROR);
            return;
        }

        const waitingRecord = await Waiting.findOne({
            where: {
                sessionId,
            },
        });

        if(!waitingRecord) {
            respondBadRequest(response, ErrorCode.SESSION_NOT_FOUND);
            return;
        }

        const waiting: WaitingEntity = castWaiting(waitingRecord);
        if(!waiting.authorized) {
            respondBadRequest(response, ErrorCode.UNAUTHORIZED_REQUEST);
            return;
        }

        waiting.expire = new Date(Date.now() + AUTHORIZATION_REFRESH_TIME);
        await waitingRecord.save();

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
    }
}


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
