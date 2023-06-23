import Post from '../../models/posts.js'
import request from '../../../node_modules/koa/lib/request.js';
import mongoose from 'mongoose';
import Joi from 'joi'


// id 검증
const {ObjectId} = mongoose.Types;
// export const checkObjectId = (ctx, next) => {
//   const {id} = ctx.params;
//   if(!ObjectId.isValid(id)) {
//     ctx.status = 400; // Bad Request
//     return;
//   }
//   return next();
// }

// 수정 및 삭제를 작성자만 가능하도록 하는 미들웨어
export const getPostById = async (ctx, next) => {
  const {id} = ctx.params;
  if(!ObjectId.isValid(id)){
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const post = await Post.findById(id);
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


/*
  POST /api/post
  {
    title : 'title',
    body : 'content',
    tags : [ 'tag1', 'tag2' ]
  }
 */
export const write = async ctx => {
  // Request Body 검증
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    title : Joi.string().required(), // required()가 있으면 필수 항목
    body : Joi.string().required(),
    tags : Joi.array()
      .items(Joi.string()).required(),
  })

  // 검증 후 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if(result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const {title, body, tags} = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user : ctx.state.user,
  })
  try {
    await post.save();
    ctx.body = post;
  } catch (e){
    ctx.throw(500, e);
  }
}

/*
  GET /api/posts
*/
export const list = async ctx => {
  // query로 페이지 번호 알아와서 그만큼 skip해주기
  // query는 문자열 => 숫자로 변환, 값이 없으면 기본값 1 사용
  const page = parseInt(ctx.query.page || '1', 10);

  if(page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const posts = await Post.find()
      .sort({_id : -1}) // _id 기준 내림차순 정렬
      .limit(10) // 10개씩 보여주기
      .skip((page - 1) * 10) 
      .lean() // body 글자수 제한을 위해 JSON 형태로 불러오기 (기본은 mongoose 문서 인스턴스 형태)
      .exec();
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts.map(post => ({
      ...post,
      body : post.body.length < 200 ? post.body : `${post.body.slice(1, 200)}...`
    }));
  } catch (e) {
    ctx.throw(500, e)
  }
}

/*
  GET /api/posts/:id
 */
export const read = async ctx => {
  // const {id} = ctx.params;
  // try {
  //   const post = await Post.findById(id).exec();
  //   if(!post) {
  //     ctx.status = 404; // not found
  //     return;
  //   }
  //   ctx.body = post;
  // }catch (e) {
  //   ctx.throw(500, e)
  // }
  ctx.body = ctx.state.posts;
}

/*
  DELETE /api/posts/:id
*/
export const remove = async ctx => {
  const {id} = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content(성공하기는 했지만 응답할 데이터는 없음)
  } catch (e) {
    ctx.throw(500, e)
  }
}

/*
  PATCH /api/posts/:id
  {
    title : '수정내용',
    body : '수정내용',
    tags : ['수정내용','수정내용']
  }
*/
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