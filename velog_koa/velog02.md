## ✅ koa-router
- Koa에서도 다른 주소로 요청이 들어오면 다른 작업을 처리할 수 있도록 라우터를 사용
- Koa 자체에 기능이 내장되어있지는 않고, koa-router 모듈 설치해 사용
> 터미널> yarn add koa-router

### 🔸 기본 사용법
```
// index.js
const Koa = require('koa');
// 🔹 koa-router를 불러와 Router 인스턴스 만들기
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

// 🔹 라우터 설정
router.get('/', ctx => {
    ctx.body = 'Home';
});
router.get('/about', ctx => {
    ctx.body = 'About';
});

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(...
```
- 🌟 router.get의 첫번째 파라미터는 라우트의 경로, 두 번째 파라미터는 해당 라우트에 적용할 미들웨어 함수
- get은 HTTP 메서드로 post, put, delete등 사용 가능
<br>
 
### 🔸 라우트 파라미터와 쿼리
#### 🔹 라우트 파라미터
- 라우트의 파라미터를 설정할 때는 /about/:name 형식으로 콜론(:)을 사용해 라우트 경로 설정
- 파라미터가 필수가 아니라 없을 수도 있다면 /:name? 형식으로 ?사용
- 이렇게 설정한 파라미터는 함수의 ctx.params 객체에서 조회 가능
- 파라미터는 주로 처리할 작업의 카테고리를 받아오거나 고유ID 혹은 이름으로 특정 데이터 조회할 때 사용
<br>

#### 🔹 URL 쿼리
- URL쿼리의 경우 ctx.query에서 조회 가능
- 쿼리 문자열을 자동으로 객체 형태로 파싱해줌
- 문자열 형태의 쿼리 문자열을 조회해야 할 때는 ctx.querystring 사용
- 주로 쿼리는 옵션에 관련된 정보를 받아옴
- 즉, 특정 조건을 만족하는 항목 보여주기나 어떤 기준으로 정렬할 때 주로 사용

#### 🔹 사용해보쟈
```
// index.js
...
router.get('/about/:name?', ctx => {
    const {name} = ctx.params;
    // name 존재여부에 따라 다른 결과 출력
    ctx.body = name ? `About ${name}` : 'About'
})

router.get('/posts', ctx => {
    const {id} = ctx.query;
    // id 존재여부에 따라 다른 결과 출력
    ctx.body = id ? `Post number ${id}` : 'No Post'
})
...
```

<br>
<br>

## ✅ REST API
- 웹 애플리케이션은 보안을 위해 브라우저가 직접 DB에 접속하지 않고 REST API를 만들어 사용
- 클라이언트가 서버에 요청을 하면, 서버는 필요한 로직에 따라 DB에 접근해 작업 처리
- REST API는 요청 종류에 따라 다른 HTTP 메서드를 사용하지만, 주로 사용하는 메서드는
  - GET : 데이터 조회
  - POST : 데이터 등록, 인증 작업
  - DELELTE : 데이터 삭제
  - PUT : 데이터 새 정보로 통째로 교체
  - PATCH : 데이터 특정 필드 수정