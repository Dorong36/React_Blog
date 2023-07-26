# title_ 토큰 발급/검증
- 클라이언트에서 사용자가 로그인 정보를 지니고 있을 수 있도록 서버에서 토큰 발급
- JWT 토큰 발급 위해서는 jsonwebtoken 모듈 설치 필요
> yarn add jsonwebtoken

<br>

## ✅ 비밀키 설정하기
- .env 파일에서 JWT 토큰을 만드는 데 사용할 비밀키를 만들어주쟈
- 비밀키는 문자열로 아무거나 입력하면 됨
- but macOS/Linux는,
  - 터미널> openssl rand -hex 64
  - 입력하면 랜덤 문자열 생성
- 만들어진 문자열을 .env파일에서 JWT_SECRET 값으로 설정
```
// .env
PORT=4000
MONGO_URI=mongodb://localhost:27017/blog
JWT_SECRET = 만들어진 문자열
```
- 해당 비밀키는 JWT 토큰의 서명을 만드는 과정에서 사용
- 외부에 공개되면 안됨(테스트용으로도 민감 정보라면 .gitignore 사용하쟈)

<br>
<br>

## ✅ 토큰 발급하기
- user 모델 파일에서 토큰 발급해주는 generateToken 인스턴스 메서드 만들기
```
...
import jwt from 'jsonwebtoken';
...
UserSchema.methods.generateToken = function() {
    const token = jwt.sign(
        // 🌟 파라미터1 : 토큰 안에 집어넣고 싶은 데이터
        {
            _id : this.id,
            username : this.username,
        },
        // 🌟 파라미터2 : JWT 암호
        process.env.JWT_SECRET,
        // 🌟 파라미터3
        {
            expiresIn: '7d' // 7일 동안 유효함
        },
    );
    return token;
}
```
- 이제 회원가입과 로그인에 성공한 사용자에게 토큰을 전달해 줄텐데,
- 브라우저에서 토큰을 사용할 때는 주로 두 가지 방법을 씀
    1. 브라우저의 localStorage 혹은 sessionStorage에 담아 사용
        - 매우 편리하고 구현이 간단
        - 악성스크립트 삽입 시 쉽게 토큰 탈취 가능(XSS-Cross Site Scripting)
        - 이는 보안장치를 적용해 두어도 다양한 취약점을 통해 공격받을 수 있음
    2. 브라우저 쿠키에 담아서 사용 ⬅️ 이거 사용할거임!!
        - httpOnly 속성 활성화로 자바스크립트를 통한 쿠키 조회를 막을 수 있음
        - 대신 CSRF(Cross Site Request Forgery : 사용자가 원치 않는 API 요청)라는 공격에 취약
        - 단 CSRF는 CSRF 토큰 사용 및 Referer 검증 등의 방식으로 제대로 막을 수 있음
- auth.ctrl.js 파일의 register와 login 함수 수정
```
...
export const register = async ctx => {
    ...
        ctx.body = user.serialize();

        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge : 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly : true, 
        });

    } catch (e) {
        ctx.throw(500, e);
    }
}


export const login = async ctx => {
    ...
        ctx.body = user.serialize();

        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge : 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly : true, 
        });

    } catch (e) {
        ctx.throw(500, e)
    }
}
...
```
- postman으로 요청 후, Headers 선택하면 Set-Cookie 헤더 확인 가능

<br>
<br>

## ✅ 토큰 검증하기
- 미들웨어를 통해 사용자의 토큰을 확인한 후 검증해보쟈
- src/lib/jwtMiddleware.js 디렉터리와 파일 생성해서 작성
```
import jwt from 'jsonwebtoken';

const jwtMiddleware = async (ctx,next) => {
    const token = ctx.cookies.get('access_token');
    if(!token) return next(); // 토큰이 없음
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        return next();
    } catch (e) {
        // 토큰 검증 실패
        return next();
    }
}

export default jwtMiddleware;
```
- main.js에서 app에 적용해주기
- 🌟 단, jwtMiddleware를 적용하는 작업이 반드시 app에 router 미들웨어를 적용하기 전에 이루어져야함!!
```
// src/main.js
...
import jwtMiddleware from './lib/jwtMiddleware.js';
...
// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());
// 🌟 라우터 적용 전에 JWT 미들웨어 적용
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());
...
```
- 아직 구현은 안했지만 /api/auth/check 경로로 GET 요청을 보내면,
- 404 오류와 별개로 콘솔에서 해석된 토큰의 결과를 확인할 수 있음
- 🌟 해석된 결과를 이후 미들웨어에서 사용할 수 있게 하려면 ctx의 state 안에 넣어 주면 됨
```
// src/lib/jwtMiddleware.js
...
const jwtMiddleware = async (ctx,next) => {
    ...
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx.state.user = {
            _id : decoded._id,
            username : decoded.username,
        };
        console.log(decoded);
        return next();
    } catch (e) {
        ...
    }
}
...
```

- auth.ctrl.js의 check 함수 구현
```
export const check = async ctx => {
    const {user} = ctx.state;
    if(!user) {
        // 로그인 중이 아님
        ctx.status = 401; //Unauthorized
        return;
    }
    ctx.body = user;
}
```
- api/auth/check으로 GET 요청시 user 정보를 응답 받을 수 있음

<br>
<br>

## ✅ 토큰 재발급하기
- jwtMiddleware을 통해 토큰 해석된 이후에 결과물에 iat, exp 키를 확인할 수 있는데,
- 이는 각각 토큰이 언제 만들어졌는지와 언제 만료되는지를 알려주는 값
- 여기서 exp가 일정 기간 미만 남았다면 새로운 토큰을 재발급해 주는 기능 구현
```
// src/lib/jwtMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const jwtMiddleware = async (ctx,next) => {
    ...
    try {
        ...
        // 토큰의 남은 유효기간이 3.5일 미만이면 재발급
        // 🔹 Date.now() 메소드는 UTC 기준으로 1970년 1월 1일 0시 0분 0초부터 현재까지 경과된 밀리초를 반환
        const now = Math.floor(Date.now() / 1000);
        if(decoded.exp - now < 60 * 60 * 24 * 3.5) {
            const user = await User.findById(decoded._id);
            const token = user.generateToken();
            ctx.cookies.set('access_token', token, {
                maxAge : 1000 * 60 * 60 * 24 * 7, // 7일
                httpOnly : true,
            })
        }
        return next();
    } catch (e) {
        // 토큰 검증 실패
        return next();
    }
}
...
```
- 확인하고 싶다면 src/models/useer.js의 generateToken의 유효기간을 3.5일 미만으로 설정해주쟈
- 토큰이 다시 발급되는 것을 확인할 수 있음!!

<br>
<br>

## ✅ 로그아웃 기능 구현하기
- 로그아웃 API는 쿠키를 지워 주기만 하면 끝!!
```
// src/api/auth/auth.ctrl.js
export const logout = async ctx => {
    ctx.cookies.set('access_token');
    ctx.status = 204; // No Content
}
```
- 해당 경로로 POST 요청하면 Headers의 Set-Cookies의 access_token이 비워진걸 확인할 수 있움