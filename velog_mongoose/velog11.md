# title - posts API에 회원 인증 시스템 도입하기
- 기존 posts API에 회원 회원 인증 시스템 도입
- 이제는 새 포스트는 로그인 해야만 작성할 수 있고,
- 삭제와 수정은 작성자만 할 수 있도록 구현
- 미들웨어를 통해 관리하고,
- 각 포스트에 사용자 정보를 담기 위해 Post 스키마 수정

<br>
<br>

## ✅ Post 스키마 수정
- 보통 관계형 DB에서는 데이터의 id만 관계 있는 데이터에 넣어주는데,
- mongoDB는 필요한 데이터를 통째로 집어넣음
- 여기서는 _id, username을 넣어줌
```
...
const PostSchema = new Schema({
    title : String,
    body : String,
    tags : [String],
    publishedDate : {
        type : Date,
        default : Date.now // 현재 날짜 기본값
    },
    user : {
        _id : mongoose.Types.ObjectId,
        username : String
    }
});
...
```
- 이후 전에 Fake Data로 만들었던 post가 남아있다면 비워주고 진행

<br>
<br>

## ✅ 로그인했을 때만 API 사용 가능하게 하기
- checkLoggedIn 미들웨어 만들어 로그인 해야만 글쓰기, 수정, 삭제 가능 하도록 구현
- 지금은 로그인 정보를 사용할 일이 적지만, 프로젝트가 커지면 로그인 정보는 다양하게 쓰임
- 때문에 lib 폴더에 미들웨어로 생성해보쟈
```
// src/lib/checkLoggedIn.js
const checkLoggedIn = (ctx, next) => {
    if(!ctx.state.user) {
        ctx.status = 401; // Unauthorized
        return;
    }
    return next();
}
export default checkLoggedIn;
```
- 로그인 여부를 확인하고 했다면 다음 미들웨어 실행, 아니면 401 오류 반환
- post 라우터에 적용해보쟈!!
```
// src/api/post/index.js
...

import checkLoggedIn from '../../lib/checkLoggedIn.js';
...
posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write); // ⬅️ 요기!!

const post = new Router(); // /api/posts/:id
post.get('/', postsCtrl.read);
post.delete('/', checkLoggedIn, postsCtrl.remove); // ⬅️ 요기!!
post.patch('/', checkLoggedIn, postsCtrl.update); // ⬅️ 요기!!
...
```

<br>
<br>

## ✅ 포스트 작성 시 사용자 정보 넣기
```
// src/api/posts/posts.ctrl.js
...
export const write = async ctx => {
    ...
    const {title, body, tags} = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
        user : ctx.state.user, // ⬅️ 요기!!
    })
    ...
}
...
```
- write 경로로 Request Body를 담아 요청했을 때 user 정보까지 잘 들어가는 것 확인

<br>
<br>

## ✅ 포스트 수정 및 삭제 시 권한 확인
### 🔸 id로 포스트 조회하는 미들웨어
- 이를 미들웨어로 처리하려면 id로 포스트를 조회하는 작업도 미들웨어로 해줘야함
- 기존 checkObjectId를 getPostById로 바꿔서,
- 해당 미들웨어에서 id로 포스트를 찾은 후 ctx.state에 담아주겠움
```
// src/api/posts/posts.ctrl.js
// 기존 checkObjectId
export const getPostById = async (ctx, next) => {
  const {id} = ctx.params;
  if(!ObjectId.isValid(id)){
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const post = await Post.findById(id); // findById는 mongoose 내장 함수
    // 포스트가 존재하지 않을 때
    if(!post) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
}
```
- 변경내용 src/api/posts/index.js에 반영
```
...
posts.use('/:id', postsCtrl.getPostById, post.routes())
export default posts;
```
- 또, read 함수가 해당 미들웨어와 거의 같은 의미라 간단하게 수정
```
export const read = ctx => {
  ctx.body = ctx.state.post;
}
```
<br>

### 🔸 포스트가 사용자가 작성한 것인지 확인하는 미들웨어
- id로 찾은 포스트가 로그인 중인 사용자가 작성한 포스트인지 확인해주쟈
```
// src/api/posts/posts.ctrl.js
...
export const checkOwnPost = (ctx, next) => {
  const {user, post} = ctx.state;
  if(post.user._id.toString() !== user._id){
    // 🌟 MongoDB에서 조회한 데이터의 id 값을 문자열과 비교할 때는 반드시 .toString()을 해줘야함!!!
    ctx.status = 403; // forbidden
    return;
  }
  return next();
}
...
```
- 이제 posts/index.js의 수정 및 삭제 API에 적용
```
...
post.delete('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove);
post.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);
...
```

<br>
<br>

## ✅ username/tags로 포스트 필터링
- 특정 사용자가 작성한 포스트 or 특정 태그가 있는 포스트만 조회하는 기능
- src/api/posts/posts.ctrl.js의 list 함수를 수정해 사용
```
export const list = async ctx => {
    ...
    // 특정 사용자 / 태그로 조회하는 코드 추가
    const {tag, username} = ctx.query;
    // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query = {
        ...(username ? {'user.username' : username} : {}),
        ...(tag ? { tags : tag } : {}),
    };

    try {
        const posts = await Post.find(query)
            .sort({_id : -1})
            .limit(10)
            .skip((page - 1) * 10) 
            .lean()
            .exec();
        const postCount = await Post.countDocuments(query).exec();
    ...
}
```
- 쿼리 객체를 만들 때, 존재여부 확인 후 spread operator(...)로 넣어주는 형식인데
- 이를 그냥 각각 객체로만 넣어주면 요청받을 때 username, tag 값이 주어지지 않고 undefined가 들어감
- 이제 쿼리 파라미터를 사용해 요청해보쟈