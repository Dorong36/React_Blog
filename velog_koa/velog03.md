## ✅ 라우트 모듈화 (API)
- 프로젝트 내에서 여러 종류의 라우트를 모두 index.js에 작성하면 가독성과 유지보수성이 떨어짐
- 때문에 라우터를 여러 파일에 분리시켜 작성하고 이를 불러와 적용
<br>

### 🔸 테스트로 기본원리 알아보쟈
- 디렉토리와 파일 생성 => src/api/index.js
```
const Router = require('koa-router');
const api = new Router();

api.get('/test', ctx => {
    ctx.body = 'Test Successed'
});

// 🌟 라우터 내보내기
module.exports = api;
```
- 기존 src/index.js
```
...
const api = require('./api');
...
// 라우터 설정
router.use('/api', api.routes()); // api 라우트 적용
...
```
- 실행시 https://loacalhost:4000/api/test 에서 확인 가능
<br>

### 🔸 posts 라우트 만들어보기
- src/api/posts/index.js 디렉토리와 파일 만들어서
```
const Router = require('koa-router');
const posts = new Router();

const printInfo = ctx => {
    ctx.body = {
        method : ctx.method,
        path : ctx.path,
        params : ctx.params,
    }
}

posts.get('/', printInfo);
posts.post('/', printInfo);
posts.get('/:id', printInfo);
posts.delete('/:id', printInfo);
posts.put('/:id', printInfo);
posts.patch('/:id', printInfo);
module.exports = posts;
```
- 이후 서버 메인 index가 아니라 api 폴더 내 index에서 라우트를 연결해줌
```
// src/api/index.js
const Router = require('koa-router');
const posts = require('./posts');

const api = new Router();

api.use('/posts', posts.routes());

module.exports = api;
```
- 이제 localhosts:4000/api/posts에서 get 요청을 확인할 수 있는데,
- 그 외 POST, DELETE, PUT, PATCH 메서드는 자바스크립트로 요청해야함
- 이를 편리하게 해주는 것이 있으니 바로~~
<br>

### 🌟 Postman
- 공식사이트(getpostman.com/)에서 설치 가능
- 설치 후 실행하면, 셀렉트 박스에서 메서드를 설정하고 주소창에 주소를 입력해 요청 가능
-  🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟사진 자리 🌟 🌟 🌟 🌟 🌟 🌟 🌟

<br>
<br>

## ✅ 컨트롤러
- 라우트 작성시 특정 경로에 미들웨어 등록할 때는 두 번째 인자에 함수를 선언해서 바로 넣어줄 수 있음
```
router.get('/' ctx => { });
```
- 하지만 각 라우트 처리 함수 코드가 길어지면 가독성이 떨어짐
- 그래서 라우트 처리 함수들을 따로 분리해서 파일로 관리 => 🌟컨트롤러🌟
<br>

### 🔸 koa-bodyparser
- koa-bodyparser는 POST/PUT/PATCH 같은 메서드의 Request Body에 JSON 형식으로 데이터를 넣어주면,
- 이를 파싱하여 서버에서 사용할 수 있게 함
- 설치해보쟈
> 터미널> yarn add koa-bodyparser
- 사용해보쟈
```
// src/index.js
...
const bodyParser = require('koa-bodyparser');
...
// 🌟 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());
...
```
<br>

### 🔸 컨트롤러 파일 작성
- posts 경로에 posts.ctrl.js 파일 생성
- write, list, read, remove, replace, update를 각각 작성
- 코드가 많이 길고 공부 과정에서 수정이 많아 저자 원본 파일 깃허브 첨부
    => https://github.com/velopert/learning-react/blob/master/21/blog/blog-backend/src/api/posts/posts.ctrl.js
- 컨트롤러를 만들며 exports.이름 형식으로 함수를 내보내 주었고, 이는 다음 형식으로 불러올 수 있음
```
const 모듈이름 = require('파일이름');
모듈이름.이름();
```
- 이는 각각의 함수 이름과 해당하는 함수를 객체 형식으로 불러옴
- 이를 각 라우트에 연결시켜줘보면!!
```
// src/api/posts/index.js
const Router = require('koa-router');
const postsCtrl = require('./posts.ctrl');

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.read);
posts.delete('/:id', postsCtrl.remove);
posts.put('/:id', postsCtrl.replace);
posts.patch('/:id', postsCtrl.update);

module.exports = posts;
```
- 일부 API 요청에 Request Body가 필요한데, 이는 Postman의 Body부분에서 넣어줄 수 있음

- 추가적으로 수정 작업에 사용되는 PUT은 전체 대치, PATCH는 일부 수정 역할을 하는데,
- 현 상태에서 PUT에 필요한 정보를 전체 다 입력하지 않아도 그대로 수정이 되는 허점이 있음
- 이는 검증 작업이 필요!!
