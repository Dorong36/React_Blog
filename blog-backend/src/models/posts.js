import mongoose from "mongoose";

const { Schema } = mongoose; // 스키마를 만드는 mongoose 모듈

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

// 모델을 만드는 mongoose.model 함수
const Post = mongoose.model('Post', PostSchema);
export default Post;