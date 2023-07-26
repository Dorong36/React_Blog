## ✅ 데이터베이스의 스키마와 모델
- 스키마는 컬렉션에 들어가는 문서 내부의 각 필드가 어떤 형식인지 정의하는 객체
- 모델은 스키마를 사용하여 만드는 인스턴스로, DB에서 실제 작업을 처리할 수 있는 함수들을 지닌 객체
<br>

### 🔸 스키마 생성
- 블로그와 관련된 내용을 스키마로 생성해보쟈
- src/models 디렉터리를 따로 만들어 저장 => 향후 유지보수가 용이
- src/models/post.js 생성
```
import mongoose from "mongoose";

const { Schema } = mongoose; // 스키마를 만드는 mongoose 모듈

const PostSchema = new Schema({
    title : String,
    body : String,
    tags : [String], // 문자열로 이루어진 배열
    publishedDate : {
        type : Date,
        default : Date.now // 현재 날짜 기본값
    },
});
```
- 스키마를 만들 때에는 mongoose 모듈의 Schema를 사용해 정의
- 그리고 Schema로 새 인스턴스를 만들어 각 필드 이름과 데이터 타입 정보가 들어있는 객체 작성
- 기존값은 default 값을 설정해주면 됨
- 스키마 내부에 다른 스키마를 내장시킬 수도 있음!!
<br>

### 🔸 모델 생성
- mongoose.model 함수를 사용해 모델 생성
- src/models/post.js에 코드 추가
```
...

const Post = mongoose.model('Post', PostSchema);
export default Post;
```
- 기본적으로 model은 ('스키마 이름', '스키마 객체')두 개의 파라미터가 필요
- DB는 스키마 이름을 정해 주면 그 이름의 복수 형태로 DB 컬렉션 이름을 만듦
- MongoDB에서 컬렉션을 만들 때 권장되는 컨벤션(convention, 협약)은 구분자없이 복수 형태로 사용하는 것
- but 세 번째 파라미터로 원하는 이름을 넣어 직접 설정도 가능
- 직접 이름을 설정해준 경우, 첫 번째 파라미터로 넣어준 이름은 다른 스키마에서 현재 스키마를 참조하는 경우에 사용됨

<br>
<br>

## ✅ MongoDB Compass
- MongoDB Compass는 MongoDB를 위한 GUI 프로그램으로, DB를 쉽게 조회하고 수정할 수 있음
- macOS와 리눅스는 MongoDB 설치와 별개로 설치 필요
> https://www.mongodb.com/download-center/compass
> Version은 Community Edition Stable
- 최초 실행 시 Connect to Host페이지에서 Port에 27017이 기본값으로 들어가있음
- 이 상태로 Connect 실행
- 이제 추후 데이터 등록 시 쉽게 조회 가능