import { CAPACITY } from "../config";
import { createSingleton} from '../repository/singleton';

export async function init() {
    await createSingleton({
        id: 0,
        capacity: CAPACITY,
    });
}