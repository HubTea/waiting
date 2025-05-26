import 'dotenv/config';

export const DATABASE_URL: string = process.env.DATABASE_URL!;
export const DATABASE_POOL_MAX: number = parseInt(process.env.DATABASE_POOL_MAX!);

export const LISTEN_PORT: number = parseInt(process.env.LISTEN_PORT!);