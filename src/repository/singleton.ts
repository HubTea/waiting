import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../connection';

export interface SingletonEntity {
    readonly id: number;
    capacity: number;
    lastNumber: number;
    currentNumber: number;
}

export class Singleton extends Model<SingletonEntity> {
    static id = 'id';
    static capacity = 'capacity';
    static lastNumber = 'lastNumber';
    static currentNumber = 'currentNumber';
}

export async function createSingleton(seed: SingletonEntity): Promise<Singleton> {
    return await Singleton.create(seed);
}

export function castSingleton(singleton: Singleton): SingletonEntity {
    return singleton as any as SingletonEntity;
}

Singleton.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },

    capacity: DataTypes.INTEGER,
    lastNumber: DataTypes.INTEGER,
    currentNumber: DataTypes.INTEGER,

}, {
    sequelize,
    freezeTableName: true,
});
