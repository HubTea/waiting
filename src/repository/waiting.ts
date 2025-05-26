import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../connection';

export interface WaitingEntity {
    id: number;
    sessionId: string;
    enterable: boolean;
    expire: Date | null;
}

export interface WaitingSeed {
    sessionId: WaitingEntity['sessionId'];
    enterable: WaitingEntity['enterable'];
    expire: WaitingEntity['expire'];
}

export class Waiting extends Model<WaitingEntity, WaitingSeed> {
    static id = 'id';
    static sessionId = 'sessionId';
    static enterable = 'enterable';
    static expire = 'expire';
}

export async function createWaiting(seed: WaitingSeed): Promise<Waiting> {
    return await Waiting.create(seed);
}

export function castWaiting(waiting: Waiting): WaitingEntity {
    return waiting as any as WaitingEntity;
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