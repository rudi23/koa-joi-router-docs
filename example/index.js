const Koa = require('koa');

const app = new Koa();
app.use(require('./routes').middleware());

app.listen(5566, () => {
    // eslint-disable-next-line no-console
    console.log('API docs url: http://localhost:5566/apiDocs');
});
