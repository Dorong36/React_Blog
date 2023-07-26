## ✅ mongoDB
### 🔸 RDBMS vs. NoSQL
- 전통적으로 많이 사용되는 관계형 데이터베이스(RDBMS)에는 몇 가지 한계가 있음
- 먼저 데이터 스키마가 고정적이라, 데이터 양이 많다면 스키마 변경 작업이 매우 번거로워짐
- 다음으로, 데이터양이 늘어나면 여러 컴퓨터에 분산하는 것이 아닌 서버 성능을 업그레이드 하는 방식으로 확장을 해줘야만함
- 이를 극복한 문서 지향적 NoSQL의 하나가 mongoDB
- mongoDB는 유동적인 스키마를 지닐 수 있고, 데이터가 많아지면 여러 컴퓨터로 분산하여 처리할 수 있음
- 물론 RDBMS와 NoSQL 각자의 장단점이 있지만,
- 데이터의 구조가 자주 바뀐다면 NoSQL이 유리하고,
- ACID 특성을 지켜야 한다면 RDBMS가 더 유리
<br>

### 🔸 mongoDB 구조
- mongoDB에서 문서(document)는 RDBMS에서 레코드와 비슷한 개념
- 문서는 BSON(바이너리 형태의 JSON) 형태로 저장
    => JSON 형태의 객체를 DB에 저장할때 편리
- 새로운 문서 만들면 _id라는 고윳값 자동으로 생성
- 문서의 모음 => Collection(컬렉션)
- 컬렉션 내부에서는 RDBMS와 다르게 서로 다른 스키마를 가진 문서들이 공존할 수 있음
- 컬렉션의 모음 => DataBase(DB)
<br>

### 🔸 스키마 디자인
- RDBMS에서는 참조할 값이 있다면 각각의 테이블을 JOIN해서 사용
- NoSQL에서는 이를 모두 한 문서에 넣어버림
- 문서 내부에 또 다른 문서가 위치할 수 있는데, 이를 Subdocument라고 함
- 서브도큐먼으 역시 일반 문서를 다루는 것처럼 쿼리할 수 있음
<br>

### 🔸 설치
> ⭐️ Mac 기준 homebrew로 설치
> 터미널> brew tap mongodb/brew
> 터미널> brew install mongodb-community@4.2
> 터미널> brew services start mongodb-community@4.2
> ⭐️ 작동 확인
> 터미널> mongo

<br>
<br>

## ✅ mongoose
- mongoose는 Node.js 환경에서 사용하는 mongoDB 기반 ODM(Object Data Modeling) 라이브러리
- DB 문서들을 자바스크립트 객체처럼 사용할 수 있게 해줌
- mongoose와 dotenv 설치
> 터미널> yarn add mongoose dotenv
- dotenv는 환경변수들을 파일에 넣고 사용할 수 있게 하는 개발도구
- 민감하거나 환경별로 달라질 수 있는 값은 코드 안에 직접 작성하지 않고 환경변수로 설정
<br>

### 🔸 환경변수 파일 생성
- 환경변수에 서버에서 사용할 포트와 mongoDB 주소 넣어주기
- 루트경로에 .env 파일 만들기
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/blog
```
- blog는 사용할 DB 이름 (없으면 자동 생성됨)
- src/index.js 파일에서 dotenv 불러와 config() 함수 호출하고, process.env로 환경변수 조회하기(Node.js 방식)
```
require('dotenv').config();
const Koa ...

// 비구조화 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const {PORT} = process.env

...

// PORT가 지정되어 있지 않다면 4000 사용
const port = PORT || 4000;
app.listen(port, () => {
    console.log('Listening to port %d', port)
})
// .env에서 PORT를 바꾸면 콘솔에 해당 포트가 찍힘
```
<br>

### 🔸 mongoose로 서버와 DB 연결
- mongoose의 connect 함수로 서버와 DB 연결
- src/index.js에서
```
...
const mongoose  =require('mongoose');

...

const { PORT, MONGO_URI } = process.env;

mongoose
    .connect(MONGO_URI)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch(e => {
            console.log(e);
        });

...
```