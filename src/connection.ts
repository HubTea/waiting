import { Sequelize, Transaction } from "sequelize";
import cls from 'cls-hooked';

import { DATABASE_URL, DATABASE_POOL_MAX } from "./config";

let namespace = cls.createNamespace('sequelize');
Sequelize.useCLS(namespace);
export let sequelize = new Sequelize(DATABASE_URL, {
    pool: {
        max: DATABASE_POOL_MAX,
    },
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
});
