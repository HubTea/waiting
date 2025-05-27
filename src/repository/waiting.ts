import {Model, DataTypes, CreateOptions} from 'sequelize';

import {sequelize} from '../connection';

export interface WaitingEntity {
    number: number;
    sessionId: string;
    authorized: boolean;
    expire: Date | null;
}

export class Waiting extends Model<WaitingEntity> {
    static number = 'number';
    static sessionId = 'sessionId';
    static authorized = 'authorized';
    static expire = 'expire';
}

export async function createWaiting(seed: WaitingEntity, option?: CreateOptions<WaitingEntity>): Promise<Waiting> {
    return await Waiting.create(seed, option);
}

export function castWaiting(waiting: Waiting): WaitingEntity {
    return waiting as any as WaitingEntity;
}

Waiting.init({
    number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },

    sessionId: {
        type: DataTypes.UUID,
        unique: true,
    },

    authorized: DataTypes.BOOLEAN,
    expire: DataTypes.DATE,

}, {
    sequelize,
    freezeTableName: true,
});
