var express = require('express');
var articleModel = require('../db/articleModel');
// 格式化时间中间件
var moment = require('moment');
var router = express.Router();

// 首页路由配置,编译index.ejs
router.get('/', function(req, res) {
    let username = req.session.username
    let page = parseInt(req.query.page || 1)
    let size = parseInt(req.query.size || 4)

    // 查询文章总数后根据size计算总页数(totalPage)
    articleModel.find().count().then(total => {
        var totalPage = Math.ceil(total / size);
        // 分页查询
        // sort可以对查询结果进行排序，sort({排序字段:-1(降序)/1(升序)})
        // limit表示需要几条数据
        // skip表示跳过几条数据
        articleModel.find().sort({ creatTime: -1 }).limit(size).skip((page - 1) * size).then(docs => {
            for (let i = 0; i < docs.length; i++) {
                // 格式化时间
                docs[i].creatTimeZH = moment(docs[i].creatTime).format('YYYY-MM-DD HH:mm:ss');
            }
            // 传输数据data
            res.render('index', {
                data: {
                    list: docs,
                    total: totalPage,
                    username
                }
            });
        })
    })
});

// 登录路由
router.get('/login', (req, res) => {
    res.render('login', {})
})

// 注册路由
router.get('/regist', (req, res) => {
    res.render('regist', {})
})

// 文章新增和修改,编译write.ejs
router.get('/write', (req, res) => {
    // console.log(111);
    let username = req.session.username
        // 判断是否有id，如果有id则为编辑，没有就是新增
    let id = req.query.id
        // console.log(username, id);
    if (id) {
        // console.log(2);
        // 编辑
        articleModel.findById(id).then(doc => {
            res.render('write', {
                data: {
                    username,
                    doc
                }
            })
        })

    } else {
        // console.log(3);
        // 没有id，新增文章 
        res.render('write', {
            data: {
                username,
                doc: {
                    _id: '',
                    title: '',
                    content: '',
                    username
                }
            }
        })
    }
})


// 文章详情
router.get('/detail', (req, res) => {
    let { id } = req.query
    let username = req.session.username
    articleModel.findById(id).then(doc => {
        doc.createTimeZH = moment(doc.creatTime).format('YYYY-MM-DD HH:mm:ss')
        res.render('detail', {
            data: {
                username,
                doc
            }
        })

    })

})



module.exports = router;