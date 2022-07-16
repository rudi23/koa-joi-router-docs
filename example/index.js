const Koa = require('koa');
const routes = require('./routes');

const app = new Koa();

app.use(routes.middleware());

app.listen(5566, () => {
    // eslint-disable-next-line no-console
    console.log('API docs url: http://localhost:5566/apiDocs');
});
