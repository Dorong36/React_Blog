# title_ 회원 인증 API 만들기
## ✅ API 구조 만들어보쟈
- src/api/auth/auth.ctrl.js 디렉터리와 파일 만들기
```
export const register = async ctx => {
    // 회원가입
};
export const login = async ctx => {
    // 로그인
};
export const check = async ctx => {
    // 로그인 상태 확인
};
export const logout = async ctx => {
    // 로그아웃
};
```
- src/api/auth/index.js 파일 생성해 auth 라우터 생성
```
import Router from 'koa-router';
import * as authCtrl from './auth.ctrl.js'

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);

export default auth;
```
- 마지막으로 api폴더 index.js에서 api 라우터 적용해주기
```
// src/api/index.js
...
import auth from './auth/index.js'
...
api.use('/posts', posts.routes());
api.use('/auth', auth.routes());
...
```
<br>

## ✅ 회원가입 구현하기
```
// src/api/auth/auth.ctrl.js
import Joi from 'joi';
import User from '../../models/user.js'

/*
    POST /api/auth/register
    {
        username : '',
        password : ''
    }
*/
export const register = async ctx => {
    // joi로 request body 검증
    const schema = Joi.object().keys({
        username : Joi.string().alphanum().min(3).max(20).required(),
        password : Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const {username, password} = ctx.request.body;
    try {
        // 🌟 username 중복을 피하기 위해 존재 여부 확인
        const exists = await User.findByUsername(username);
        if(exists) {
            ctx.status = 409 // Conflict
            return;
        }

        const user = new User({
            username,
        });
        // 🌟 setPassword 인스턴스 함수로 비밀번호 설정
        await user.setPassword(password); 
        await user.save(); // 데이터베이스에 저장

        // 응답할 데이터에서 hashedPassword 필드 제거
        const data = user.toJSON();
        delete data.hashedPassword;
        ctx.body = data; 
    } catch (e) {
        ctx.throw(500, e);
    }
};
```
- setPassword 처럼 스태틱, 인스턴스 함수 작업들을 API 내부에서 구현해도 상관 없지만, 
- 이처럼 메서드로 만들어 사용하면 가독성과 유지보수성이 높아짐
- 마지막 hashPassword는 응답되지 않도록 제거해주었는데, 자주 사용되는 작업이므로 인스턴스 함수로 따로 만들어두쟈
```
// src/models/user.js
UserSchema.methods.serialize = function() {
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
}
```
- 기존 코드도 대체
```
// src/api/auth/auth.ctrl.js
...
export const register = async ctx => {
    ...
        const user = new User({
            username,
        });
        await user.setPassword(password); 
        await user.save();
        ctx.body = user.serialize(); 
    } catch (e) {
        ctx.throw(500, e);
    }
};
...
```
- postman으로 Request Body를 담아 POST 요청을 해보쟈
<br>

## ✅ 로그인 구현하기
```
// src/api/auth/auth.ctrl.js
/*
    POST /api/auth/login
    {
        username : '',
        password : ''
    }
*/
export const login = async ctx => {
    const {username, password} = ctx.request.body;

    // 🌟 username, password가 없으면 에러 처리
    if(!username || !password) {
        ctx.status = 401; // Unauthorized
        return;
    }

    try {
        const user = await User.findByUsername(username);
        // 🌟 계정이 존재하지 않으면 에러처리
        if(!user) {
            ctx.status = 401;
            return;
        }
        // 🌟 계정이 유효하면 비밀번호 검사해서 성공시 계정 정보 응답
        const valid = await user.checkPassword(password);
        if(!valid) {
            ctx.status = 401;
            return;
        }
        ctx.body = user.serialize();
    } catch (e) {
        ctx.throw(500, e)
    }
}
```
- postman으로 Request Body를 담아 POST 요청을 해보쟈