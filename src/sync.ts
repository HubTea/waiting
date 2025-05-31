import './repository/singleton';
import './repository/waiting';
import { sequelize } from './connection';

/**
 * 테이블을 모두 drop 한 뒤 새로 생성한다.
 */
export async function sync() {
    await sequelize.sync({
        force: true,
    });
}
