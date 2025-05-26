import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../connection';

export interface SingletonEntity {
    id: number;
    capacity: number;
}

export interface SingletonSeed {
    capacity: SingletonEntity['capacity'];
}

export class Singleton extends Model<SingletonEntity, SingletonSeed> {
    static id = 'id';
    static capacity = 'capacity';
}

export async function createSingleton(seed: SingletonSeed): Promise<Singleton> {
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
    
}, {
    sequelize,
    freezeTableName: true,
});
