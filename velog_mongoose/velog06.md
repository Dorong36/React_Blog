## ✅ 페이지네이션 구현
- 포스트 목록을 볼 때 일반적으로 개수를 제한해서 보여줌
- 또, 포스트 목록에 전체 내용을 보여줄 필요는 없음
- 두 가지 모두 불필요하게 로딩 속도가 지연되고 트래픽이 낭비
<br>

### 🔸 Fake data 생성하기
- 여러 데이터 임시로 만들기 위해 가짜 데이터 생성해보쟈
- 중간 오류부분 stackOverflow 참조 수정
```
import Post from './models/posts.js'

export default function createFakeData() {
    // 0, 1, ... , 39로 이루어진 배열 생성한 후 포스트 데이터로 변환
    const posts = [...Array(40).keys()].map(i => ({
        title : `Post${i}`,
        // lipsum.com에서 복사한 200자 이상의 텍스트
        body : 
            `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
        tags : ['fake', 'data']
    }));

    // * 에러 : Model.insertMany() no longer accepts a callback
    // Post.insertMany(posts, (err, docs) => {
    //     console.log(docs)
    // })

    // * stackOverflow 참조, then, catch문으로 대체
    Post.insertMany(posts).then(function (docs) {
        console.log(docs)
      }).catch(function (err) {
        console.log(err);
      });
}
```
- main.js에 import해서 호출
```
...
import createFakeData from './createFakeData';
...
mongoose
.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        createFakeData(); // ⬅️ 요기!!
    })
    .catch( e => {
        console.error(e);
    })
```
- 서버 재시작하면 DB에 데이터들 등록됨
<br>

### 🔸 포스트 역순으로 불러오기
- 포통 페이지는 최신 포스트가 위에 위치하는 내림차순(역순)
- 이는 list API에서 exec()를 하기 전에 sort()구문을 넣어주면 됨
- sort의 파라미터는 { key : 1 }과 같은 형태로,
- key는 정렬 기준이 되는 필드, 숫자는 1은 오름차순, -1은 내림차순 의미
```
// src/api/posts/posts.ctrl.js
...
export const list = async ctx => {
  try {
    const posts = await Post.find()
        .sort({ _id : -1 }) // ⬅️ 요기!!
        .exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e)
  }
}
...
```
<br>

### 🔸 보이는 개수 제한
- 한 번에 보이는 개수를 제한하려면 limit()함수 사용
- 파라미터에는 제한할 숫자를 넣으면 됨
```
// src/api/posts/posts.ctrl.js
...
export const list = async ctx => {
  try {
    const posts = await Post.find()
        .sort({ _id : -1 }) 
        .limit(10) // ⬅️ 요기!!
        .exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e)
  }
}
...
```
<br>

### 🔸 페이지 기능 구현
- limit 함수와 skip 함수로 페이지 기능 구현 가능
- skip 함수의 파라미터로 숫자를 넣어주면, 그 수만큼 포스트를 제외하고 그다음 데이터를 불러옴
- 여기서는 10개씩 페이지에 보여줄 것이므로, (page - 1) * 10 로 사용할 수 있겠음
- page 값은 query에서 받아오도록 설정 (기본값 1)
```
// src/api/posts/posts.ctrl.js
...
export const list = async ctx => {
    // query로 페이지 번호 알아와서 그만큼 skip해주기
    // query는 문자열 => 숫자로 변환, 값이 없으면 기본값 1 사용
    const page = parseInt(ctx.query.page || '1', 10); // 두 번째 파라미터 10은 10진수 의미

    if(page < 1) {
        ctx.status = 400;
        return;
    }

    try {
        const posts = await Post.find(query)
            .sort({_id : -1})
            .limit(10)
            .skip((page - 1) * 10) // ⬅️ 요기!!
            .exec();
            ctx.body = posts;
    } catch (e) {
        ctx.throw(500, e)
    }
}
...
```
<br>

### 🔸 마지막 페이지 번호 알려 주기
- 응답 내용 형식 바꿔 새로운 필드 설정하기, Response 헤더 중 Link 설정하는 등 방법 있지만
- 여기서는 커스텀 헤더를 설정하는 방법으로 해보겠음
```
export const list = async ctx => {
    ...
    try {
        const posts = await Post.find(query)
            .sort({_id : -1})
            .limit(10)
            .skip((page - 1) * 10)
            .exec();
        const postCount = await Post.countDocuments().exec(); // ⬅️ 요기!!
        ctx.set('Last-Page', Math.ceil(postCount / 10)); // ⬅️ 요기!!
        ctx.body = posts;
    } catch (e) {
        ctx.throw(500, e)
    }
}
```
- Last-Page라는 커스텀 HTTP 헤더 설정
<br>

### 🔸 내용 길이 제한
- 목록페이지에서 전체 내용이 나올 필요 없지
- 일정 길이 이상은 자르고 ...으로 표현하기
```
export const list = async ctx => {
    ...
    try {
        ...
        ctx.body = posts
            .map(post => post.toJSON())
            .map(post => ({
                ...post,
                body : post.body.length < 200 ? post.body : `${post.body.slice(1, 200)}...`
        }))
    } catch (e) {
        ctx.throw(500, e)
    }
}
```
- 또 데이터를 조회할 때 lean()함수를 사용하는 방법이 있음
- 이렇게 하면 데이터를 처음부터 JSON 형태로 조회 가능
```
export const list = async ctx => {
    ...
    try {
        const posts = await Post.find(query)
            .sort({_id : -1})
            .limit(10)
            .skip((page - 1) * 10) 
            .lean() // 🌟 body 글자수 제한을 위해 JSON 형태로 불러오기 (기본은 mongoose 문서 인스턴스 형태)
            .exec();
        ...
        ctx.body = posts.map(post => ({
            ...post,
            body : post.body.length < 200 ? post.body : `${post.body.slice(1, 200)}...`
        }));
    } catch (e) {
        ctx.throw(500, e)
    }
}
```