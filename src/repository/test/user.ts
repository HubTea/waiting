import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../../connection';

export interface UserSeed {
    name: string;
    age: number;
}

export interface UserEntity extends UserSeed{
    readonly id: number;
}

export class User extends Model<UserEntity, UserSeed> {}
User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
}, {
    sequelize,
    freezeTableName: true,
});

export function castUser(userRecord: User): UserEntity {
    return userRecord as any as UserEntity;
}

export async function createUser(seed: UserSeed): Promise<User> {
    return await User.create(seed);
}

export const userAttribute: Record<keyof UserEntity, string> = {
    id: 'id',
    name: 'name',
    age: 'age',
};
