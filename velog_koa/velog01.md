## ✅ Koa란?
- Node.js 환경에서 웹서버 구축에 사용하는 대표적 프레임 워크(Express, Hapi, Koa)중 하나
- Express 기존 개발팀이 내부 설계상 고칠 수 없는 단점들을 개선하고자 아예 새롭게 개발한 프레임워크
- Express는 미들웨어, 라우팅, 템플릿, 파일 호스팅 등 다양한 기능이 자체적으로 내장
- Koa는 미들웨어 기능만 갖추고 있으며, 나머지는 다른 라이브러리를 적용하여 사용
- 즉, Koa는 필요 기능들만 붙여서 서버를 만들 수 있기 때문에 Express보다 훨씬 가벼움
- 추가로 Koa는 async/await 문법 정시긍로 지원해 비동기 작업을 더 편하게 관리

<br>
<br>

## ✅ 작업 환경 준비
- Koa 설치
> 터미널> yarn add koa
- ESLint 설정
> 터미널> yarn add --dev eslint
> yarn run eslint --init
> 이후 세부 설정은 서적 참조 (604p)
- Prettier 설정
> .prettier 파일 생성해 설정하고,
> Prettier에서 관리하는 코드 스타일은 ESLint에서 관리하지 않도록 설치하여 적용
> yarn add eslint-config-prettier
- eslint는 사용되지 않는 const 값을 오류로 취급, console.log를 지양
- 해결법 : .eslintrc.json에서
```
{
    ...
    rules : {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
```

<br>
<br>

## ✅ Koa 기본 사용법
### 🔸 서버 띄우기
```
// index.js

const Koa = require('koa');
const app = new Koa();

app.use(ctx => {
    ctx.body = 'hello world';
})

app.listen(4000, () => {
    console.log('Listening to port 4000');
})

// 실행은
// 터미널> node src
```
<br>

### 🔸 Middleware
#### 🔹 Koa 애플리케이션은 미들웨어의 배열로 구성
- 앞서 사용한 app.use 함수는 미들웨어 함수를 애플리케이션에 등록
> 미들웨어 함수의 구조
> (ctx, next) => {
> }
- Koa의 미들웨어 함수는 ctx와 next라는 두 개의 파라미터를 받음
  - ctx는 Context의 줄임말로 웹 요청과 응답에 관한 정보를 지님
  - next는 현재 처리 중인 미들웨어의 다음 미들웨어를 호출하는 함수
        => 미들웨어를 등록하고 next 함수를 호출하지 않으면 다음 미들웨어를 처리하지 않음
        => 만약 미들웨어서 next를 사용하지 않으면 파라미터에서 생략 가능
- 미들웨어는 app.use를 사용해 등록되는 순서대로 처리
```
// index.js
...
app.use((ctx, next) => {
    console.log(ctx.url);
    console.log(1);
    next();
});
app.use((ctx, next) => {
    console.log(2);
    next();
});
app.use(...
...
```
- 서버 재실행시 순서대로(1,2) 콘솔에서 확인 가능
- 여기서 첫 미들웨어의 next()함수를 제거하면 이후 미들웨어는 무시됨
- 이같은 속성을 사용해 조건부로 다음 미들웨어 처리를 무시하게 만들 수 있음 (쿼리 파라미터 or 요청의 쿠키 혹은 헤더를 통해)
```
// index.js
...
app.use((ctx, next) => {
    console.log(ctx.url);
    console.log(1);
    if(ctx.query.authorized !== 1) {
        ctx.status = 401;
        return;
    }
    next()
});

app.use(...
...

// localhost:4000/?authorized=1 로 접속시에만 미들웨어 모두 처리되어 hello world 화면 보임
// 그 외에는 Unauthorized가 보임
```
<br>

#### 🔹 next함수는 Promise를 반환
- 이는 Express와 차별화되는 부분
- next 함수가 반환하는 Promise는 다음에 처리해야 할 미들웨어가 끝나야 완료됨
```
// index.js
...
app.use((ctx, next) => {
    console.log(ctx.url);
    console.log(1);
    if(ctx.query.authorized !== 1) {
        ctx.status = 401;
        return;
    }
    next().then(()=>{
        console.log('END');
    })
});

app.use(...
...

// 해당 주소로 이동시
// 콘솔에 1과, 그 다음 미들웨어의 2가 모두 찍힌 후 END가 찍힘
```
<br>

#### 🔹 async/await 사용하기
- Koa는 async/await 문법을 정식으로 지원
- 위 내용을 이 버전으로 작성하면
```
// index.js
...
app.use(async (ctx, next) => {
    console.log(ctx.url);
    console.log(1);
    if(ctx.query.authorized !== 1) {
        ctx.status = 401;
        return;
    }
    await next();
    console.log('END');
});

app.use(...
...
```
<br>
<br>

## ✅ nodemon
- 코드 변경 및 저장시 서버를 자동으로 재시작 해주는 도구
- 개발용 의존 모듈로 설치
> 터미널> yarn add --dev nodemon
- 그리고, package.json에서 서버 시작 명령어를 설정할 수 있는데,
```
// package.json
{
    ...,
    "scripts" : {
        "start" : "node src",
        "start:dev" : "nodemon --watch src/ src/index.js"
    }
}
```
- start에는 서버를 시작하는 명령어를(파일 변경시 재시작 필요X),
- start:dev에는 nodemon을 통해 서버를 실행해 주는 명령어를 넣었음(파일 변경시 재시작O)