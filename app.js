// 处理http错误
var createError = require('http-errors');
var express = require('express');
// npm i express-session -S
var session = require('express-session')
var path = require('path');
// 处理cookie
var cookieParser = require('cookie-parser');
// 日志工具
var logger = require('morgan');

// 子路由文件导入
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles')

var app = express();
// 链接数据库
var db = require('./db/connect')

// 配置ejs模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用日志工具
app.use(logger('dev'));

// 解析http请求的请求主体的
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 解析cookie
app.use(cookieParser());

// 使用session中间件
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}))

// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 用户子路由
app.use('/users', usersRouter);


// 鉴权
app.all('*', (req, res, next) => {
    // 除了登录和注册页面，其他页面需要登录后才能查看
    // console.log(req.path);
    if (req.url != '/login' && req.url != '/regist') {
        // 判断是否登录
        if (req.session.isLogin) {
            next()
        } else {
            res.redirect('/login')
        }
    } else {
        next()
    }
})



// 使用子路由
app.use('/', indexRouter);
app.use('/articles', articlesRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;