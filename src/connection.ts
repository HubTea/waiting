import { Sequelize, Transaction } from "sequelize";
import cls from 'cls-hooked';

import { DATABASE_URL, DATABASE_POOL_MAX } from "./config";

const namespace = cls.createNamespace('sequelize');
Sequelize.useCLS(namespace);
export const sequelize = new Sequelize(DATABASE_URL.href, {
    pool: {
        max: DATABASE_POOL_MAX,
    },
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
});
