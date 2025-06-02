import 'dotenv/config';
import {number} from 'yup';

const integer = (a: string) => number().required().integer().validateSync(a);

//데이터베이스 연결 설정
//required. example: postgres://username:password@localhost:5432/database-name
export const DATABASE_URL: URL = new URL(process.env.DATABASE_URL!);
//optional. default: 100
export const DATABASE_POOL_MAX: number = integer(process.env.DATABASE_POOL_MAX || '100');

//TCP listen 포트 설정
//optional. default: 3456
export const LISTEN_PORT: number = integer(process.env.LISTEN_PORT || '3456');
//optional. default: 3457
export const STUB_LISTEN_PORT: number = integer(process.env.STUB_LISTEN_PORT || '3457');

//애플리케이션 설정
//optional. default: http://localhost:3457
export const UPSTREAM_URL: URL = new URL(process.env.UPSTREAM_URL || 'http://localhost:3457');
//optional. default: 1
export const CAPACITY: number = integer(process.env.CAPACITY || '1');
//optional. default: 10000
export const AUTHORIZATION_REFRESH_TIME: number = integer(process.env.AUTHORIZATION_REFRESH_TIME || '10000'); //단위: ms

//batch 설정
//optioanl. default: 5000
export const INVALIDATION_INTERVAL: number = integer(process.env.INVALIDATION_INTERVAL || '5000'); //단위: ms
