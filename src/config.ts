import 'dotenv/config';

export const DATABASE_URL: string = process.env.DATABASE_URL!;
export const DATABASE_POOL_MAX: number = parseInt(process.env.DATABASE_POOL_MAX!);

export const LISTEN_PORT: number = parseInt(process.env.LISTEN_PORT!);

export const CAPACITY: number = parseInt(process.env.CAPACITY!);
//단위: ms
export const AUTHORIZATION_REFRESH_TIME: number = parseInt(process.env.AUTHORIZATION_REFRESH_TIME!);