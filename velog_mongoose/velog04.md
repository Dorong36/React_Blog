## ✅ DB 데이터 CRUD
- 이전에 컨트롤러 파일로 작성했던 posts.ctrl.js파일은 포스트들을 임시 배열로 구현
- 이는 서버 재시작하면 초기화 되므로 이제 MongoDB에 연결해서 해보쟈
- 기존 posts.ctrl.js 파일 전체 지움
```
// src/api/posts/posts.ctrl.js
import Post from '../../models/post';

export const write = ctx => {};
export const list = ctx => {};
export const read = ctx => {};
export const remove = ctx => {};
export const update = ctx => {};
```
- PUT은 구현하지 않음. src/api/posts/index.js에서도 해당부분 제거
<br>

### 🔸 데이터 생성
```
// src/api/posts/posts.ctrl.js
export const write = async ctx => {
  const {title, body, tags} = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  })
  try {
    await post.save();
    ctx.body = post;
  } catch (e){
    ctx.throw(500, e);
  }
}
```
- new 키워드로 포스트 인스턴스 생성
- 생성자 함수의 파라미터에 정보를 지닌 객체 넣어주기
- 인스턴스를 만들고 save()함수 실행시켜야 DB에 저장
- save()함수의 반환값은 Promise로, async/await 문법 사용가능
- 위에서는 함수 선언에 async 키워드를 넣어주고 DB 저장 완료시까지 await으로 대기시킴
- 또한 await을 사용할 때는 try/catch 문으로 오류 처리

- postman에서 POST 메서드로 Post 모델 형식 데이터 Request Body에 담아 요청
- MongoDB Compass에서 posts 컬렉션과 데이터가 생성됨 확인
<br>

### 🔸 데이터 조회
```
export const list = async ctx => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e)
  }
}
```
- 데이터 조회는 모델 인스턴스 find() 함수를 사용
- find() 호출 후 exec()를 붙여 줘야 서버에 쿼리 요청
- 데이터 조회 조건과 제한 설정도 할 수 있음

- postman에서 GET 메서드로 요청
- 포스트 배열 응답 확인
<br>

### 🔸 특정 데이터 조회
```
export const read = async ctx => {
  const {id} = ctx.params;
  try {
    const post = await Post.findById(id).exec();
    if(!post) {
      ctx.status = 404; // not found
      return;
    }
    ctx.body = post;
  }catch (e) {
    ctx.throw(500, e)
  }
}
```
- 특정 id를 가진 포스트 조회는 findById()함수 사용
- postman에서 GET메서드로 api/posts/:id 경로로 특정 id 담아 요청
<br>

### 🔸 데이터 삭제
- 데이터 삭제는 여러 종류의 함수 사용 가능
> remove() : 특정 조건 만족 데이터 모두 제거
> findByIdAndRemove() : id를 찾아서 제거
> findOneAndRemove() : 특정 조건 만족 데이터 하나 찾아서 제거
- 여기서는 findByIdAndRemove 사용
```
export const remove = async ctx => {
  const {id} = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content(성공하기는 했지만 응답할 데이터는 없음)
  } catch (e) {
    ctx.throw(500, e)
  }
}
```
- postman에서 api/posts/:id 경로로 특정 id 담아 DELETE 요청
- 204 No Content 응답 확인, 같은 id 재요청시 404 Not Found 응답 확인
<br>

### 🔸 데이터 수정
- 데이터 업데이트에는 findByIdAndUpdate() 함수 사용
- 이 함수에는 세 가지 파라미터(id, 업데이트 내용, 업데이트 옵션)이 필요
```
export const update = async ctx => {
  const {id} = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new : true, // 이 값을 설정하면 업데이트된 데이터를 반환
      // false일 때는 업데이트되기 전의 데이터를 반환
    }).exec();
    if(!post){
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e)
  }
}
```
- postman에서 api/posts/:id 경로에 Request Body에 수정할 데이터를 담아 PATCH 요청
- PATCH 메서드는 데이터의 일부만 Request Body에 넣어줘도 그 부분만 수정이됨