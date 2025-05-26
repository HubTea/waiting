import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../connection';

export interface WaitingEntity {
    number: number;
    sessionId: string;
    authorized: boolean;
    expire: Date | null;
}

export interface WaitingSeed {
    sessionId: WaitingEntity['sessionId'];
    enterable: WaitingEntity['authorized'];
    expire: WaitingEntity['expire'];
}

export class Waiting extends Model<WaitingEntity, WaitingSeed> {
    static number = 'number';
    static sessionId = 'sessionId';
    static authorized = 'authorized';
    static expire = 'expire';
}

export async function createWaiting(seed: WaitingSeed): Promise<Waiting> {
    return await Waiting.create(seed);
}

export function castWaiting(waiting: Waiting): WaitingEntity {
    return waiting as any as WaitingEntity;
}

Waiting.init({
    number: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    sessionId: {
        type: DataTypes.UUID,
        unique: true,
    },

    authorized: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    expire: DataTypes.DATE,

}, {
    sequelize,
    freezeTableName: true,
});