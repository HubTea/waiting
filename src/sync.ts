import './repository/singleton';
import './repository/waiting';
import { sequelize } from './connection';

export async function sync() {
    await sequelize.sync({
        force: true,
    });
}
