## ✅ esm
- Node.js 환경에서는 기존 리액트에서 사용하던 export/import 문법을 정식으로 지원하지 않음
- 정확히는 기능은 구현되어있드나 실험적 단계라 조금 복잡
- 필수적 요소는 아니지만 VSCode에서 사용의 유용성과(자동완성 등) 코드의 가독성을 위해 esm 라이브러리로 이를 사용해보쟈
- 설치
> 터미널> yarn add esm
<br>

### 🔸 esm 기본설정
- 기존 src/index.js를 main.js로 이름변경
- 새롭게 index.js를 만들어 작성
- 교재내용이 현재 버전에서 오류발생,,
- 구글링 뒤진 바탕으로 수정한 내용으로 기록
- 일단, Node 13.2 버전 이후에는 라이브러리를 사용하지 않고도 ES module로 전환가능
```
// src/index.js
// 이 파일에서만 no-global-assign ESLint 옵션 비활성화
/* eslint-disable no-global-assign */

import * as esm from '/esm';
export * from './main.js';
```
- package.json 파일 수정
```
{
    ...,
    "scripts": {
    "start": "node src",
    "start:dev": "nodemon --watch src/ src/index.js"
    },
    "type": "module"
}
```
- .eslintrc.json
```
{
    ...,
    "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module"
    },
    ...
}
```
- 이제 import/export 사용 가능
<br>

### 🔸 기존 코드 ES Module 형태로 바꾸기
- 🌟 import시 확장자까지 꼭 다 써주기!!!
- src/api/posts/posts.ctrl.js 내 exports 코드 export const로 변경
- src/api/posts/index.js 파일 수정
```
import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl.js';
...
export default posts;
```
- src/api/index.js 파일 수정
```
import Router from 'koa-router';
import posts from './posts/index.js';
/* 
🌟 import 시 확장자를 다 써줘야해서
🌟 원래는 './posts'까지만 써도 index가 바로 참조가 되지만
🌟 여기서는 내부 '/index.js'까지도 써줘야함!!
*/
...
export default api;
```
- src/main.js 수정
```
import dotenv from 'dotenv';
dotenv.config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

import api from './api/index.js';
...
```
- 프로젝트 루트 디렉터리에 jsconfig.json 작성
```
{
    "compilerOptions": {
        "target": "ES6",
        "module": "es2015"
    },
    "include": ["src/**/*"]
}
```