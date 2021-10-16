// 用户子路由

var express = require('express');
var router = express.Router();
var userModel = require('../db/userModel')

// 测试接口1，获取所有用户列表
router.get('/list', (req, res) => {
    userModel.find({}).then(docs => {
        res.json({ err: 0, msg: 'success', data: docs })
    }).catch(err => {
        res.json({ err: 1, msg: 'fail' })
    })
})

// 测试接口2，删除所有用户列表
router.get('/del', (req, res) => {
    userModel.deleteMany({}).then(docs => {
        res.json({ err: 0, msg: 'success', data: docs })
    }).catch(err => {
        res.json({ err: 1, msg: 'fail' })
    })
})

// 登录接口
router.post('/login', (req, res) => {
    // 接收post的数据
    let { username, password } = req.body
        // 查询数据库是否有该数据
    userModel.find({ username, password }).then(docs => {
        if (docs.length > 0) {
            // 数据库有该用户,登录成功，设置session
            req.session.isLogin = true;
            req.session.username = username;
            // res.send('登录成功，重定向到/')
            res.redirect('/')

        } else {
            // res.send('用户不存在,重定向到/login')
            res.redirect('/login')
        }
    }).catch(err => {
        // res.send('服务器错误')
        res.redirect('/')
    })
})

// 注册接口
router.post('/regist', (req, res) => {
    // console.log(req.body);
    // 接收post的数据
    let { username, password } = req.body
    userModel.find({ username }).then(docs => {
        // console.log(docs);
        // 如果user集合已经存在，注册失败
        if (docs.length > 0) {
            // res.send('用户名已经存在') // 后期会重定向
            res.redirect('/regist')
        } else {
            // 注册成功,把数据写入数据库，重定向到/login
            let creatTime = Date.now()
                // 把数据写入数据库
            userModel.insertMany({
                username,
                password,
                creatTime
            }).then(data => {
                // res.send('注册成功') // 后期重定向到 /login
                res.redirect('/login')
            }).catch(err => {
                // res.send('注册失败，服务器错误')
                res.redirect('/regist')
            })
        }
    }).catch(err => {
        res.send('服务器错误')
    })

})

// 退出接口
router.get('/logout', (req, res) => {
    // console.log(req.session.isLogin,req.session.username);
    // 清除session
    req.session.isLogin = false;
    req.session.username = null;
    // res.send('退出成功,重定向到/login')
    res.redirect('/login')
})

module.exports = router;