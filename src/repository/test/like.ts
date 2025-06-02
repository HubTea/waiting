import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../../connection';
import { articelAttribute, Article } from './article';
import { User, userAttribute } from './user';

//컬럼 정의
export interface LikeSeed {
    articleId: number,
    userId: number,
}

//auto increment같이 데이터베이스가 자동으로 값을 지정하는 컬럼 정의
export interface LikeModel extends LikeSeed{
    
}

//연관관계 속성 정의
export interface LikeEntity extends LikeModel {
    ArticleLikeAssociation: Article;
    UserLikeAssociation: User;
}

export class Like extends Model<LikeModel, LikeSeed> {}
Like.init({
    articleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
}, {
    sequelize,
    freezeTableName: true,
    name: {
        singular: Like.name,
        plural: Like.name,
    },
});

export function castLike(LikeRecord: Like): LikeEntity {
    return LikeRecord as any as LikeEntity;
}

export async function createLike(seed: LikeSeed): Promise<Like> {
    return await Like.create(seed);
}

export const LikeAttribute: Record<keyof LikeEntity, string> = {
    articleId: 'articleId',
    userId: 'userId',
    ArticleLikeAssociation: 'ArticleLikeAssociation',
    UserLikeAssociation: 'UserLikeAssociation',
};
