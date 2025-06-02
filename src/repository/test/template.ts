import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../../connection';

//컬럼 정의
export interface _ModelName_Seed {
    content: string;
}

//auto increment같이 데이터베이스가 자동으로 값을 지정하는 컬럼 정의
export interface _ModelName_Entity extends _ModelName_Seed {
    readonly id: number;
}

export class _ModelName_ extends Model<_ModelName_Entity, _ModelName_Seed> {}
_ModelName_.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    content: DataTypes.STRING,
}, {
    sequelize,
    freezeTableName: true,
});

export function cast_ModelName_(_ModelName_Record: _ModelName_): _ModelName_Entity {
    return _ModelName_Record as any as _ModelName_Entity;
}

export async function create_ModelName_(seed: _ModelName_Seed): Promise<_ModelName_> {
    return await _ModelName_.create(seed);
}

export const _ModelName_Attribute: Record<keyof _ModelName_Entity, string> = {
    id: 'id',
    content: 'content',
};
