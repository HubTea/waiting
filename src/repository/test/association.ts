import {createUser, castUser, User, UserEntity} from './user';
import {Article, ArticleEntity, castArticle, createArticle} from './article';
import { Like, LikeAttribute, createLike, castLike, LikeEntity } from './like';
import { sequelize } from '../../connection';
import { Association, DataTypes, HasManyOptions } from 'sequelize';
import { WhereOptions } from 'sequelize';

let option: HasManyOptions = {
    as: LikeAttribute.ArticleLikeAssociation,
    foreignKey: LikeAttribute.articleId,
    constraints: false,
};
Article.hasMany(Like, option);
Like.belongsTo(Article, option);

option = {
    as: LikeAttribute.UserLikeAssociation,
    foreignKey: LikeAttribute.userId,
    constraints: false,
}
User.hasMany(Like, option);
Like.belongsTo(User, option);

async function main() {
    try {
        await sequelize.sync({force: true});

        let userRecord: User = await createUser({
            name: 'sdf',
            age: 1,
        });
        const user: UserEntity = castUser(userRecord);

        const articleRecord1: Article = await createArticle({
            content: 'hello world',
        });

        const articleRecord2: Article = await createArticle({
            content: 'hell wrold',
        });
        const article2: ArticleEntity = castArticle(articleRecord2);

        const likeRecord: Like = await createLike({
            userId: user.id,
            articleId: article2.id,
        });
        const like: LikeEntity = castLike(likeRecord);

        function castWhere<T>(option: WhereOptions<T>) {
            return option;
        }

        const articleRecordList: Article[] = await Article.findAll({
            include: {
                model: Like, as: LikeAttribute.ArticleLikeAssociation,
                where: castWhere<LikeEntity>({
                    userId: user.id,
                }),
                include: [{
                    model: User, as: LikeAttribute.UserLikeAssociation,
                    where: castWhere<UserEntity>({
                        age: 1,
                    }),
                    required: false,
                }],
                required: false,
                duplicating: false,
            },
            limit: 5,
        });

        const userRecordList: User[] = await User.findAll({
            include: {
                model: Like,
                as: LikeAttribute.UserLikeAssociation,
            }
        });

        console.log('user join like');
        for(const userRecord of userRecordList) {
            console.log(userRecord.toJSON());
        }

        console.log('like');
        for(const likeRecord of await Like.findAll()) {
            console.log(likeRecord.toJSON());
        }
        
        console.log('join');
        for(const articleRecord of articleRecordList) {
            console.log(articleRecord.toJSON());
        }
        console.log('end');
    }
    catch(error) {
        console.log(error);
    }
}

void main();
