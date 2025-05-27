import { CAPACITY } from "../config";
import { Singleton, createSingleton} from '../repository/singleton';
import { Waiting } from "../repository/waiting";

export async function init() {
    await Waiting.truncate();
    await Singleton.truncate();
    await createSingleton({
        id: 0,
        capacity: CAPACITY,
        lastNumber: 0,
    });
}