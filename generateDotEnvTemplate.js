/**
 * ./src/config.ts 파일로부터 값이 비어있는 .env.stage 파일을 생성한다.
 * config.ts 내의 설정 한 줄은 export const ENTRY: number = ...와 같이
 * export const로 시작하고 타입이 표기되어 있어야 한다.
 */
const fs = require('fs');

const LINE_FEED = '\r\n';
const COMMENT_PREFIX = '//';
const ENTRY_PREFIX = 'export const ';

const envFile = fs.openSync('./.env.stage', 'w');
const configFile = fs.readFileSync('./src/config.ts').toString();
const lineList = configFile.split(LINE_FEED);

for(const line of lineList) {
    if(line.startsWith(COMMENT_PREFIX)) {
        fs.writeSync(envFile, '#' + line.substring(2) + LINE_FEED);
    }
    else if(line.startsWith(ENTRY_PREFIX)) {
        const entryName = line.split(':')[0].replaceAll(ENTRY_PREFIX, '');
        fs.writeSync(envFile, entryName + '=' + LINE_FEED);
    }
    else {
        fs.writeSync(envFile, LINE_FEED);
    }
}
