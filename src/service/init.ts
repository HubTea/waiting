import { CAPACITY } from "../config";
import { Singleton, createSingleton} from '../repository/singleton';
import { Waiting } from "../repository/waiting";
import {sequelize} from '../connection';

export async function init() {
    await Waiting.truncate();
    await Singleton.truncate();
    await createSingleton({
        id: 0,
        capacity: CAPACITY,
        lastNumber: 0,
        currentNumber: 0,
    });
    await sequelize.close();
}