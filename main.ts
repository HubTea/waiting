import 'dotenv/config';
import {Sequelize, Model, DataTypes} from 'sequelize';
import express from 'express';

let sequelize = new Sequelize(process.env.DB_URL as string);
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
app.listen(parseInt(process.env.LISTEN_PORT as string), () => console.log('listening ' + process.env.LISTEN_PORT));

