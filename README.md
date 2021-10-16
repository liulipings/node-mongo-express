### 1 使用express-generator初始化项目
```js
npm install express-generator -g
express -e articleM  // -e 指的是使用ejs模板引擎
cd articleM
npm install // 下载依赖包
npm start   // package.json里面的:"start":"nodemon ./bin/www"
```

### 2 详解express-generator脚手架搭建的项目结构
+ package.json:项目信息的描述文件
  + scripts里面定义快捷命令
  + cookie-parser:用于解析cookie会话数据
  + morgan:是一个日志工具
  + serve-favicon:用于设置网站的favicon
+ public: 存放静态资源的
+ views: 存放模板文件的
+ routes: 存放子路由文件的
+ app.js: 路由和中间件的配置
+ bin里面的www用于开启web服务器

### 3 数据库集合结构
+ 在项目根目录里面新建db文件夹
  + 用于存放数据库链接和集合结构书写
  + connect.js 数据库链接文件
  + userModel.js 用户集合文件
  + articleModel.js 文章集合文件
```js
// connect.js
// 引入mongoose
const mongoose = require('mongoose');
// 链接数据库
mongoose.connect('mongodb://localhost:27017/am')
const db = mongoose.connection;

db.on('error',function(){
    console.log('数据库链接错误')
})

db.once('open',function(){
    console.log('数据库链接成功')
})

module.exports = db;
```

```js
// userModel.js
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    username:String,
    password:String,
    createTime:Number
})

const userModel = mongoose.model('users',userSchema);

module.exports = userModel;
```

```js
// articleModel.js
const mongoose = require('mongoose');
const articleSchema = mongoose.Schema({
    title:String,
    content:String,
    username:String,
    createTime:Number
})

const articleModel = mongoose.model('articles',articleSchema)

module.exports = articleModel;
```
### 4 public目录和views目录改造
+ public:把所有的静态资源都放进去
+ views 
  + 把所有的html文件放入
  + 后缀名改为ejs
  + 提前相同部分，利用include引入
  + 改造css,js,img的链接地址，以public为根目录书写

### 5 路由说明
> 编译模板的路由

路由|功能|请求方式|入参|返回值|说明
-|-|-|-|-|-
/|编译index.ejs模板|get|page,size|返回index页面|无
/regist|编译regist.ejs模板|get|无|返回regist页面|无
/login|编译login.ejs模板|get|无|返回login页面|无
/write|编译write.ejs模板|get|id|返回write页面|登录后访问，有id是编辑，无id是新增
/detail|编码detail.ejs模板|get|id|返回detail页面|无

> 用户业务路由

路由|功能|请求方式|入参|返回值|说明
-|-|-|-|-|-
/users/regist|注册业务|post|username,password,password2|重定向|注册成功重定向到/login,失败重新重定向到/regist
/users/login|登录业务|post|username,password|重定向|登录成功重定向到/,失败重新重定向到/login
/users/logout|退出登录业务|get|无|重定向|退出登录后重定向到/login


> 文章业务路由

路由|功能|请求方式|入参|返回值|说明
-|-|-|-|-|-
/articles/write|文章修改与新增业务|post|title,content,username,id|重定向|有id是修改业务，无id是新增业务，成功重定向/，失败重定向/write
/articles/delete|文章删除业务|get|id|重定向|成功或失败都重定向/
/articles/upload|文件上传业务|post|file|json|{err:0,msg:'图片路径'}




### 6 模板子路由
> index.js
```js
var express = require('express');
var router = express.Router();

// 首页路由
router.get('/',function(req,res){
   res.render('index',{})
})

// 注册页路由
router.get('/regist',function(req,res){
   res.render('regist',{})
})

// 登录页路由
router.get('/login',function(req,res){
   res.render('login',{})
})

// 写文章页路由
router.get('/write',function(req,res){
   res.render('write',{})
})

// 详情页路由
router.get('/detail',function(req,res){
   res.render('detail',{})
})

module.exports = router;

```
> 注意:
+ 在这里把页面子路由完成以后，更新模板里面的页面a链接里面href属性


### 7 app.js
```js
// 处理http错误
var createError = require('http-errors'); 
var express = require('express');
var path = require('path');
// 处理cookie
var cookieParser = require('cookie-parser');
// favicon.ico
var favicon = require('serve-favicon')
// 日志工具
var logger = require('morgan');

// 子路由文件导入
var indexRouter = require('./routes/index');

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
// favicon.ico
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 使用子路由
app.use('/', indexRouter);

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

```

### 8 用户子路由
> users.js
```js
const express = require('express');
const userModel = require('../db/userModel')
const router = express.Router();

// 测试使用:获取所有用户列表
router.get('/list',(req,res)=>{
    userModel.find({}).then(docs=>{
        res.json({err:0,msg:'success',data:docs})
    }).catch(err=>{
        res.json({err:1,msg:'fail'})
    })
})
// 测试使用:删除所有用户列表
router.get('/del',(req,res)=>{
    userModel.deleteMany({}).then(docs=>{
        res.json({err:0,msg:'success',data:docs})
    }).catch(err=>{
        res.json({err:1,msg:'fail'})
    })
})


// 登录接口
router.post('/login',(req,res)=>{
    // 接收post的数据
    let {username,password} = req.body ;// 解构赋值
    // 查询数据库里面是否有该用户
    userModel.find({username,password}).then(docs=>{
        if(docs.length>0){
            req.session.isLogin = true;
            req.session.username = username;
            // 数据库有该用户
            res.send('登录成功')
        }else{
            res.send('用户不存在');
        }
    }).catch(err=>{
        res.send('服务器错误')
    })
})

// 退出登录
router.get('/logout',(req,res)=>{
    console.log(req.session.isLogin)
    // req.session.isLogin = false;
    // req.session.username = null;
    console.log(req.session.isLogin)
    res.send('退出登录成功')
})

// 注册业务
router.post('/regist',(req,res)=>{
    // 接收post的数据
    console.log(req.body); // post请求主体会在req.body这个对象里面
    // 获取请求主体里面的用户名和密码
    // let username = req.body.username
    // let password = req.body.password
    // 可以简写成
    let {username,password} = req.body ;// 解构赋值
    // 这个用户在数据库里面是否存在
    userModel.find({username}).then(docs=>{
        // doc是一个数组，里面包含查询到的所有符合条件的用户
        if(docs.length>0){
            // 如果存在，就是注册失败
            res.send('用户名已存在');// 后期会改成重定向
        }
        else{
            // 如果不存在，就开始注册
            let createTime = Date.now(); // 当前时间的时间戳
            userModel.insertMany({
                username,
                password,
                createTime
            }).then(data=>{
                res.send('注册成功');// 后期会改成重定向
            }).catch(err=>{
                res.send('注册失败,服务端错误');// 后期会改成重定向
            })
        }
    })
    
})

module.exports = router;
```

### 9 文章子路由
> articles.js
```js
const express = require('express');
const multiparty = require('multiparty');
const router = express.Router();
const path = require('path')
const fs = require('fs')
const articleModel = require('../db/articleModel');

// 测试开发
router.get('/list',function(req,res){
    articleModel.find().then(docs=>{
        res.send(docs)
    })
})

// 文件上传
// 文件上传请求示例:http://locahost:3000/aritcles/upload
router.post('/upload',function(req,res){
    // 创建一个解析表单的对象
    var form = new multiparty.Form();
    // form.parse这个方法就是把请求req里面的表单数据进行解析
    form.parse(req, function(err, fields, files) {
        if(err){
            res.send({msg:'文件上传失败'})
        }else{
            // console.log("=======fields=======")
            // console.log(fields);// 文字信息
            // console.log("=======files=======")
            // console.log(files);// 文件信息
            /* 
                {
                    filedata: [
                        {
                        fieldName: 'pic',
                        originalFilename: 'favicon.ico',
                        path: 'C:\\Users\\ADMINI~1\\AppData\\Local\\Temp\\xki5BkrPDq3dW9t2bkZD6h5x.ico',
                        headers: [Object],
                        size: 4286
                        }
                    ]
                }
            */
            var file = files.filedata[0];
            // 读取文件
            var read = fs.createReadStream(file.path);
            // 写入到public里面的images里面
            var write = fs.createWriteStream(path.join(__dirname,'..','public','images',file.originalFilename))
            // 管道流
            read.pipe(write);
            write.on('close',()=>{
                // 
                res.json({err:0,msg:'/public/images/'+file.originalFilename})
            })
        }
    });
})

// 文章删除
// 删除请求示例:http://locahost:3000/aritcles/delete?id=xxxxxx
router.get('/delete',function(req,res){
    let {id} = req.query;  // {id:xxx}
    articleModel.deleteOne({_id:id}).then(data=>{
        res.json({msg:'文章删除成功，马上重定向到/'})
    }).catch(err=>{
        res.json({msg:'服务器错误，马上重定向到/'})
    })

})

// 文章修改或者新增
// 修改请求示例:http://locahost:3000/aritcles/write,有id=xxxxx参数
// 新增请求示例:http://locahost:3000/aritcles/write,无id参数
router.post('/write',function(req,res){
    let {title,content,id} = req.body;
    let createTime = Date.now();
    if(id){
        // 修改文章
        articleModel.updateOne({_id:id},{
            title,
            content,
            createTime
        }).then(data=>{
            res.send({msg:'文章修改成功，马上重定向到/'})
        }).catch(err=>{
            res.json({msg:'服务器错误,马上重定向到/write'})
        })
    }else{
        // 记录写文章的用户的用户名
        let username = req.session.username;
        // 新增文章
        articleModel.insertMany({
            title,
            content,
            username,
            createTime
        }).then(docs=>{
            res.json({msg:'文章新增成功,马上重定向到/',data:docs})
        }).catch(err=>{
            res.json({msg:'服务器错误,马上重定向到/write'})
        })
    }

})


module.exports = router;
```

> 在app.js要导入
```js
var articlesRouter = require('./routes/articles');
app.use('/articles', articlesRouter); // 文章业务子路由
```

> 注意:
+ 在文章路由里面需要接收表单上传的文件
+ body-parser不擅长，我们使用multiparty模块
+ 安装:npm i multipary -S

### 10 模板子路由-首页路由
```js
var express = require('express');
var moment = require('moment')
var router = express.Router();
var articleModel = require('../db/articleModel')

// 编译index.ejs路由
router.get('/',function(req,res){
  console.log(req.query);
  let page = parseInt(req.query.page||1);
  let size = parseInt(req.query.size||2);
  let username = req.session.username;
  console.log(username)
  // 第一步:查询文章总数计算出总页数
  // count:计算总条数
  articleModel.find().count().then(total=>{
    // 计算出总页数
    var totalPage =  Math.ceil(total/size);
    // 分页查询
    // sort可以对查询结果排序：sort({排序字段:-1是降序1是升序})
    // limit表示需要几条数据
    // skip表示跳过几条数据
    articleModel.find().sort({createTime:-1}).limit(size).skip((page-1)*size).then(docs=>{
        for(var i=0;i<docs.length;i++){
          docs[i].createTimeZH = moment(docs[i].createTime).format('YYYY-MM-DD HH:mm:ss');
        }
        res.render('index',{
          data:{
            list:docs,
            total:totalPage,
            username
          }
        })
    })
  })
})
```

### 11 完成首页模板
```html
<!DOCTYPE html>
<html>
  <%-include('head',{title:"首页"})%>
  <body>
  <%-include('bar',{username:data.username})%>
    <div class="list">
        <% data.list.map((ele,index)=>{ %>
          <div class="row">
            <span><%=(index+1)%></span>
            <span><%=ele.username%></span>
            <span><a href="/detail?id=<%=ele._id%>"><%=ele.title%></a></span>
            <span><%=ele.createTimeZH%></span>
            <%if(ele.username == data.username){%>
              <span>
                <a href="/write?id=<%=ele._id%>">编辑</a>
                <a href="/articles/delete?id=<%=ele._id%>">删除</a>
              </span>
            <%}%>
          </div>
        <%})%>

        <div class="pages">
            <% for(let i=1;i<=data.total;i++){ %>
              <a href="/?page=<%=i%>"><%=i%></a>
            <% } %>
        </div>

    </div>
  </body>
</html>

```

### 12 完成注册页模板
```html
<!DOCTYPE html>
<html lang="en">
<%-include('head',{title:"注册"})%>
<body>

  <div class="form-box">
    <form method="post" action="/users/regist">
      <input type="text" name="username" value="" placeholder="请输入用户名">
      <input type="password" name="password" value="" placeholder="请输入密码">
      <input type="password" name="password2" value="" placeholder="请确认密码">
      <input type="submit" name="" value="注册">
    </form>
    <div>已有账号，<a href="/login">立即登录</a>！</div>
  </div>

</body>
</html>
```

### 13 完成登录页模板
```html
<!DOCTYPE html>
<html lang="en">
<%-include('head',{title:"登录"})%>
<body>

  <div class="form-box">
    <form method="post" action="/users/login">
      <input type="text" name="username" value="" placeholder="请输入用户名">
      <input type="password" name="password" value="" placeholder="请输入密码">
      <input type="submit" name="" value="登录">
    </form>
    <div>已有账号，<a href="/regist">立即注册</a>！</div>
  </div>

</body>
</html>
```

### 14 模板子路由-写文章路由
```js
router.get('/write',function(req,res){
  // req.query是:get请求?后面的参数，被解析成了一个对象
  let id = req.query.id;
  let username = req.session.username;
  if(id){
    // 修改
    articleModel.findById(id).then(doc=>{
      res.render('write',{
        data:{
          username,
          doc
        }
      })
    })
  }else{
    // 新增
    res.render('write',{
      data:{
        username,
        doc:{
          _id:'',
          title:'',
          content:'',
          username
        }
      }
    })
  }
  
})
```

### 15 完成写文章模板
```html
<!DOCTYPE html>
<html lang="en">

<%-include('head',{title:"写文章"})%>

<body>

  <%-include('bar',{username:data.username})%>

  <div class="article">
    <form method="post" action="/articles/write">
      <input type="hidden" name="id" value="<%=data.doc._id%>">
      <input type="hidden" name="page" value="文章页数">
      <input type="text" name="title" placeholder="请输入文章标题" value="<%=data.doc.title%>">
      <textarea name="content" class="xheditor"><%=data.doc.content%></textarea>
        <%if(data.doc._id){%>
          <input type="submit" value="修改">
        <%}else{%>
          <input type="submit" value="发布">
        <%}%>
        
        
    </form>
  </div>

  <script type="text/javascript" src="/xheditor/jquery/jquery-1.4.4.min.js"></script>
  <script type="text/javascript" src="/xheditor/xheditor-1.2.2.min.js"></script>
  <script type="text/javascript" src="/xheditor/xheditor_lang/zh-cn.js"></script>
  <script>
    //  引入富文本编辑器插件xheditor
    $('.xheditor').xheditor({
       tool:'full',
       skin:"default",
       upImgUrl:'/articles/upload',
       html5Upload:false,
       upMultiple:1
    })
  </script>
</body>

</html>

```

### 16 完成删除文章功能
```js
router.get('/delete',function(req,res){
    let {id} = req.query;  // {id:xxx}
    articleModel.deleteOne({_id:id}).then(data=>{
        // res.json({msg:'文章删除成功，马上重定向到/'})
        res.redirect('/')
    }).catch(err=>{
        // res.json({msg:'服务器错误，马上重定向到/'})
        res.redirect('/')
    })
})
```

### 17 完成退出功能
```js
// 退出登录请求示例:http://localhost:3000/users/logout
router.get('/logout',function(req,res){
    console.log(req.session.isLogin)
    console.log(req.session.username)
    req.session.isLogin = false;
    req.session.username = null;
    // res.json({msg:'退出登录成功,马上重定向到/'})
    res.redirect('/')
})
```

### 18 模板子路由-详情路由
```js
router.get('/detail',function(req,res){
  // 获取参数里面的id
  let id = req.query.id;
  let username = req.session.username;
  // 根据id查询文章信息
  articleModel.findById(id).then(doc=>{
    doc.createTimeZH = moment(doc.createTime).format('YYYY-MM-DD HH:mm:ss')
    res.render('detail',{
      data:{
        username,
        doc
      }
    })
  })
  
})

```

### 19 完成详情模板
```html
<!DOCTYPE html>
<html lang="en">
<%-include('head',{title:"详情页"})%>
<body>

  <%-include('bar',{username:'xxxx'})%>
  

  <div class="detail">
    <div class="title"><%=data.doc.title%></div>
    <div class='desc'>
      <span>作者：<%=data.doc.username%></span>
      <span>发布时间：<%=data.doc.createTimeZH%></span>
    </div>
    <div class="content"><%=data.doc.content%></div>
  </div>

</body>
</html>
```

### 20 鉴权
```js
var createError = require('http-errors');
var express = require('express');
// 可以记录登录信息
var session = require('express-session')
// favicon.ico
var favicon = require('serve-favicon')
// 链接数据库
var db = require('./db/connect')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 导入路由文件
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');

var app = express();

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// 解析post请求主体，解析完成以后，会把请求主体的参数都放在req上
// req.body 是一个对象，这个对象就是解析好的post请求参数
// username:zhangsan
// password:123456
// req.body = {username:zhangsan,password:123456}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
// favicon.ico
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// 配置静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 配置session
// 在req上就会多一个session属性，是一个对象
// 可以在对象里面写入信息
// 请求会自动携带
app.use(session({
  secret: 'sz2111a',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge:60*60*1000
  }
}))

app.use('/users', usersRouter); // 用户业务子路由

// 鉴权
app.all('*',function(req,res,next){
   if(req.url!='/login'&&req.url!='/regist'){
      if(req.session.isLogin){
        next()
      }else{
        res.redirect('/login')
      }
   }else{
      next()
   }
})

// 使用子路由
app.use('/', indexRouter);   // 模板子路由
app.use('/articles', articlesRouter); // 文章业务子路由

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

```

