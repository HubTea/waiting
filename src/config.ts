import 'dotenv/config';
import {number} from 'yup';

const integer = (a: string) => number().required().integer().validateSync(a);

export const DATABASE_URL: URL = new URL(process.env.DATABASE_URL!);
export const DATABASE_POOL_MAX: number = integer(process.env.DATABASE_POOL_MAX!);

export const LISTEN_PORT: number = integer(process.env.LISTEN_PORT!);
export const STUB_LISTEN_PORT: number = integer(process.env.STUB_LISTEN_PORT!);

export const UPSTREAM_URL: URL = new URL(process.env.UPSTREAM_URL!);
export const CAPACITY: number = integer(process.env.CAPACITY!);
export const AUTHORIZATION_REFRESH_TIME: number = integer(process.env.AUTHORIZATION_REFRESH_TIME!); //단위: ms

export const INVALIDATION_INTERVAL: number = integer(process.env.INVALIDATION_INTERVAL!); //단위: ms
