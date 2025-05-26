import 'dotenv/config';
import {Sequelize, Model, DataTypes} from 'sequelize';
import express from 'express';

const DATABASE_URL: string = process.env.DATABASE_URL!;
const LISTEN_PORT: number = parseInt(process.env.LISTEN_PORT!);

let sequelize = new Sequelize(DATABASE_URL);
sequelize.authenticate().then(() => console.log('sequelize authenticated'));

interface WaitingEntity {
    id: number;
    sessionId: string;
    enterable: boolean;
    expire: Date | null;
}

class Waiting extends Model<WaitingEntity> implements WaitingEntity {
    id!: number;
    sessionId!: string;
    enterable!: boolean;
    expire!: Date | null;

    static id = 'id';
    static sessionId = 'sessionId';
    static enterable = 'enterable';
    static expire = 'expire';
}

async function createWaiting(entity: WaitingEntity): Promise<Waiting> {
    return await Waiting.create(entity);
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

let app = express();
app.listen(LISTEN_PORT, function (error) {
    if(error) {
        throw error;
    }
    console.log('listening ' + LISTEN_PORT)
});

app.post('/waiting', async function register(request, response) {

});

app.get('/waiting', async function getWaiting(request, response) {

});

app.get('/ticket', async function getTicket(request, response) {

});

app.all('/{*anyPath}', async function relay(request, response) {
    
});
