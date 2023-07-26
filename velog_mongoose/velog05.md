## ✅ 요청검증 - ObjectId
- 이전 read API 실행 시 id가 올바른 형식이 아니면 500 오류 발생
- 이는 서버에서 처리하지 않아 내부에서 문제가 생겼을 때 발생
- 잘못된 id가 전달되었다면 클라이언트의 요청이 잘못된 것이니 400 Bad Request가 옳음
- 이를 검증해주려면 아래 코드 사용
```
import mongoose from 'mongoose';

const {ObjectId} = mongoose.Types;
ObjectId.isValid(id);
```
- 이는 read 외에도 remove, update에 필요
- 때문에 중복해 넣지 않고 미들웨어를 만들어 처리
```
// src/api/posts/posts.ctrl.js
...
import mongoose from 'mongoose';

const {ObjectId} = mongoose.Types;

export const checkObjectId = (ctx, next) => {
  const {id} = ctx.params;
  if(!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  return next();
}
```
- 그리고 이를 src/api/posts/index.js에서 필요한 부분에 미들웨어 추가
```
...
posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.checkObjectId, postsCtrl.read);
posts.delete('/:id', postsCtrl.checkObjectId, postsCtrl.remove);
posts.put('/:id', postsCtrl.checkObjectId, postsCtrl.replace);
...
```
- 이는 아래와 같이 리팩토링이 가능
```
posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);

const post = new Router(); // /api/posts/:id
post.get('/', postsCtrl.read);
post.delete('/', postsCtrl.remove);
post.patch('/', postsCtrl.update);

posts.use('/:id', postsCtrl.checkObjectId, post.routes())
```
- /api/posts/:id 경로를 위한 라우터를 새로 만들고 posts에 해당 라우터를 등록해줌

<br>
<br>

## ✅ 요청검증 - Request Body
- 포스트 작성시 서버는 title, body, tags 값을 모두 전달 받아야함
- 클라이언트가 값을 누락하면 400 오류가 발생해야함
- 이를 if문으로 비교해 검증할 수도 있지만, 더 쉽게 도와주는 라이브러리가 있음
- 설치
> 터미널> yarn add joi

### 🔹 write 함수에서 검증해보기
```
// src/api/posts/posts.ctrl.js
...
import Joi from 'joi';
...
export const write = async ctx => {
    // Request Body 검증
    const schema = Joi.object().keys({
        // 객체가 다음 필드를 가지고 있음을 검증
        title : Joi.string().required(), // required()가 있으면 필수 항목
        body : Joi.string().required(),
        tags : Joi.array().items(Joi.string()).required(), // 문자열로 이루어진 배열
    })

    // 검증 후 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    ...
}
```
- write API 호출 시 Request Body에 필요 필드가 빠지면 400 오류와 에러 응답
<br>

### 🔹 update 함수에서 검증해보기
- write와 비슷하지만 .required()가 필요없음
- 자료형 제한의 역할
```
export const update = async ctx => {
    const {id} = ctx.params;

    // Request Body 검증 => write와 비슷한데 required()가 없음
    const schema = Joi.object().keys({
        // 객체가 다음 필드를 가지고 있음을 검증
        title : Joi.string(),
        body : Joi.string(),
        tags : Joi.array().items(Joi.string()),
    })

    // 검증 후 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    ...
}
```