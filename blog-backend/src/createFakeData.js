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