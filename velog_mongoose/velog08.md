# title - User 스키마/모델 만들기
- User 스키마와 모델을 작성해 MongoDB에 담고 조회해보쟈
- 비밀번호를 DB에 플레인(가공X)상태로 저장하는 것은 보안상 매우 위험!!
- 따라서 단방향 해싱 함수를 지원해주는 bcrypt 라이브러리 사용

## ✅ 기본 스키마와 모델 만들기
```
// src/models/user.js 파일 생성해 작성
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username : String,
    hashedPassword : String,
})

const User = mongoose.model('User', UserSchema);
export default User;
```
- 해시를 만드는 함수와 해시 검증 함수는 bcrypt 사용
> 터미널> yarn add bcrypt

<br>
<br>

## ✅ 모델 메서드 만들기
- 모델 메서드는 모델에서 사용할 수 있는 함수를 의미하며, 두 가지 종류가 있음
  1. 인스턴스 메서드 : 모델을 통해 만든 문서 인스턴스에서 사용 할 수 있는 함수
  2. 스태틱 메서드 : 모델에서 바로 사용할 수 있는 함수
<br>

### 🔸 인스턴스 메서드 만들기
- 비밀번호를 파라미터로 받아서 계정의 hashedPassword 값을 설정해주는 setPassword 메서드
- 파라미터로 받은 비밀번호가 해당 계정의 비밀번호가 맞는지 검증해주는 checkPassword 메서드
```
// src/models/user.js
import bcrypt from 'bycrpt';
...
UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;
}

UserSchema.methods.checkPassword = async function(password) {
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
}
...
```
- 🌟 인스턴스 메서드를 작성할 대는 화살표 함수가 아닌 function 키워드 사용!!
    => 함수 내부에서 this(문서 인스턴스)에 접근해야 하기 때문
<br>

### 🔸 스태틱 메서드 만들기
- username으로 데이터 찾을 수 있게 해주는 findByUsername 메서드
```
// src/models/user.js
...
UserSchema.statics.findByUsername = function(username) {
    return this.findOne({username})
}
...
```
- 스태틱 함수에서 this는 모델을 가리킴(여기서는 User)