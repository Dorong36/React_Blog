import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new Schema({
    username : String,
    hashedPassword : String,
})


// 인스턴스 메서드
UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;
}

UserSchema.methods.checkPassword = async function(password) {
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
}

UserSchema.methods.serialize = function() {
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
}

UserSchema.methods.generateToken = function() {
    const token = jwt.sign(
        // 파라미터1 : 토큰 안에 집어넣고 싶은 데이터
        {
            _id : this.id,
            username : this.username,
        },
        // 파라미터2 : JWT 암호
        process.env.JWT_SECRET,
        // 파라미터3
        {
            expiresIn: '7d' // 7일 동안 유효함
        },
    );
    return token;
}


// 스태틱 메서드
UserSchema.statics.findByUsername = function(username) {
    return this.findOne({username})
}

const User = mongoose.model('User', UserSchema);
export default User;