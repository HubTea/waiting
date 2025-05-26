import crypto from 'crypto';
import express from 'express';

import { WaitingEntity, createWaiting, castWaiting } from './repository/waiting';
import { LISTEN_PORT } from './config';

export let app = express();
app.listen(LISTEN_PORT, function (error) {
    if(error) {
        throw error;
    }
    console.log('listening ' + LISTEN_PORT)
});

app.put('/waiting', async function register(request, response) {
    let sessionId: string = crypto.randomUUID();

    let waiting: WaitingEntity = castWaiting(await createWaiting({
        sessionId,
        enterable: false,
        expire: null,
    }));

    response.json({
        sessionId: waiting.sessionId,
    });
});

app.get('/waiting', async function getWaiting(request, response) {

});

app.get('/ticket', async function getTicket(request, response) {

});

app.all('/{*anyPath}', async function relay(request, response) {
    
});
