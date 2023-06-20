import Post from '../../ models/posts.js'
import request from '../../../node_modules/koa/lib/request.js';
import mongoose from 'mongoose';
import Joi from 'joi'


// id 검증
const {ObjectId} = mongoose.Types;
export const checkObjectId = (ctx, next) => {
  const {id} = ctx.params;
  if(!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  return next();
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
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e)
  }
}

/*
  GET /api/posts/:id
 */
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