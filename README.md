# Waiting
서버의 동시 접속자 수를 제한하기 위한 대기열 서버입니다.

![](./flowchart.svg)

## 설정
Node.js 버전 22.12.0에서 작동을 확인했습니다.
의존성 패키지를 설치하고 프로젝트를 빌드합니다.
```sh
npm i
npx tsc
```
아래 스크립트를 실행한 뒤 생성된 .env.stage 파일의 이름을 .env로 수정한 뒤 적절한 값을 넣습니다.
구체적으로 어떤 종류의 값이 들어가는지는 ./src/config.ts 파일을 참고합니다.
주석에 required로 표시된 값은 반드시 지정해야 합니다.
```sh
node ./generateDotEnvTemplate.js
```
아래 스크립트를 실행하여 데이터베이스를 초기화합니다.
DBMS로 PostgreSQL과 MySQL을 사용할 수 있습니다.
DBMS 내에 사용할 데이터베이스가 먼저 만들어져 있어야 합니다.
```sh
node -e "import x from './dist/sync.js'; await x.sync()"
node -e "import x from './dist/service/init.js'; await x.init()"
```


## 실행
아래 두 개의 명령어를 각각 별도의 쉘에서 실행합니다.
```sh
npm run start:prod
```
```sh
node ./dist/batch/invalidate.js
```
Nest application successfully started가 출력되면 [http://localhost:3456/index.html](http://localhost:3456/index.html)로 접속합니다. 포트 번호는 설정한 값에 맞춰 수정해야 합니다.

세 개의 버튼을 사용해서 대기열 등록, upstream 서버에 요청, 퇴장 기능을 사용할 수 있습니다. 최대 동시 접속자 수의 기본값을 1로 설정했기 때문에 2개 이상의 브라우저를 사용한다면 한 쪽에서는 다른 쪽이 퇴장 처리되기 전까지 upstream에 요청을 보내지 못하는 것을 확인할 수 있습니다.
