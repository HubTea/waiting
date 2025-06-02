import {Model, DataTypes} from 'sequelize';

import {sequelize} from '../../connection';
import { Like } from './like';

export interface ArticleSeed {
    content: string;
}

export interface ArticleModel extends ArticleSeed {
    readonly id: number;
}

export interface ArticleEntity extends ArticleModel {
    readonly ArticleLikeAssociation: Like[];
}

export class Article extends Model<ArticleModel, ArticleSeed> {}
Article.init({
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

export function castArticle(articleRecord: Article): ArticleEntity {
    return articleRecord as any as ArticleEntity;
}

export async function createArticle(seed: ArticleSeed): Promise<Article> {
    return await Article.create(seed);
}

export const articelAttribute: {[k in keyof ArticleEntity]: k} = {
    id: 'id',
    content: 'content',
    ArticleLikeAssociation: 'ArticleLikeAssociation',
};
