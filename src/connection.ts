import { Sequelize } from "sequelize";

import { DATABASE_URL, DATABASE_POOL_MAX } from "./config";

export let sequelize = new Sequelize(DATABASE_URL, {
    pool: {
        max: DATABASE_POOL_MAX,
    },
});
