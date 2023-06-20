// require('dotenv').config();
import dotenv from 'dotenv'
dotenv.config();

import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

// 확장자 꼭 붙여주기!!
import api from './api/index.js'
import jwtMiddleware from './lib/jwtMiddleware.js';

// 비구조화할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

mongoose
.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch( e => {
        console.error(e);
    })

const app = new Koa();
const router = new Router();

// 라우터 설정
router.use('/api', api.routes()); // api 라우트 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());
// 라우터 적용 전에 JWT 미들웨어 적용
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// PORT가 지정되어 있지 않다면 4000 사용
const port = PORT || 4000;
app.listen(port, () => {
    console.log('Listening to port %d', port)
})