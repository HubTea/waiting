import crypto from 'crypto';

import 'dotenv/config';
import {Sequelize, Model, DataTypes} from 'sequelize';
import express from 'express';

//전역 변수 설정
const DATABASE_URL: string = process.env.DATABASE_URL!;
const DATABASE_POOL_MAX: number = parseInt(process.env.DATABASE_POOL_MAX!);
const LISTEN_PORT: number = parseInt(process.env.LISTEN_PORT!);

//Sequelize 설정
let sequelize = new Sequelize(DATABASE_URL, {
    pool: {
        max: DATABASE_POOL_MAX,
    },
});
sequelize.authenticate().then(() => console.log('sequelize authenticated'));

//Sequelize 모델 정의
interface WaitingEntity {
    id: number;
    sessionId: string;
    enterable: boolean;
    expire: Date | null;
}

interface WaitingSeed {
    sessionId: WaitingEntity['sessionId'];
    enterable: WaitingEntity['enterable'];
    expire: WaitingEntity['expire'];
}

class Waiting extends Model<WaitingEntity, WaitingSeed> {
    static id = 'id';
    static sessionId = 'sessionId';
    static enterable = 'enterable';
    static expire = 'expire';
}

Waiting.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    sessionId: {
        type: DataTypes.UUID,
        unique: true,
    },

    enterable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    expire: DataTypes.DATE,

}, {
    sequelize,
    freezeTableName: true,
});

async function createWaiting(seed: WaitingSeed): Promise<Waiting> {
    return await Waiting.create(seed);
}

function castWaiting(waiting: Waiting): WaitingEntity {
    return waiting as any as WaitingEntity;
}

//express 설정
let app = express();
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
