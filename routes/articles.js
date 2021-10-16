const express = require('express');
// 文件上传中间件
const multiparty = require('multiparty');
const path = require('path')
const fs = require('fs')
const articleModel = require('../db/articleModel')
const router = express.Router()

// 测试接口 查询所有文章
router.get('/list', (req, res) => {
    articleModel.find().then(data => {
        res.json({ msg: '查询成功' })
    })
})

// 测试接口 删除所有文章
router.get('/del', (req, res) => {
    articleModel.deleteMany().then(data => {
        res.json({ msg: '删除成功', data })
    })
})


// 文章新增和修改
router.post('/write', (req, res) => {
    // console.log(req.body);
    let { title, content, id } = req.body
    let creatTime = Date.now()
    if (id) {
        // 有id就是修改文章
        articleModel.updateOne({ _id: id }, {
            title,
            content,
            creatTime
        }).then(data => {
            // res.send({ msg: '文章修改成功，重定向到/' })
            console.log(data);
            res.redirect('/')
        }).catch(err => {
            // res.json({ msg: '服务器错误，重定向到/write' })
            res.redirect('/write')
        })
    } else {
        // 没有id就是新增文章
        // 记录当前登录的用户名
        let username = req.session.username
        articleModel.insertMany({
            title,
            content,
            username,
            creatTime
        }).then(data => {
            // console.log(title, content);
            // res.send({ msg: '文章新增成功，重定向到/' })
            res.redirect('/')
        }).catch(err => {
            // res.json({ msg: '服务器错误，重定向到/write' })
            res.redirect('/write')
        })
    }

})

// 文章删除
router.get('/delete', (req, res) => {
    let { id } = req.query
    articleModel.deleteOne({ _id: id }).then(data => {
        // console.log(data);
        // res.json({ msg: '文章删除成功，重定向到/' })
        res.redirect('/')
    }).catch(err => {
        // res.json({ msg: '服务器错误，重定向到/' })
        res.redirect('/')
    })
})

// 文件上传
// 文件上传请求示例:http://locahost:3000/aritcles/upload
router.post('/upload', function(req, res) {
    // 创建一个解析表单的对象
    var form = new multiparty.Form();
    // form.parse这个方法就是把请求req里面的表单数据进行解析
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.send({ msg: '文件上传失败' })
        } else {
            // console.log("=======fields=======")
            // console.log(fields);// 文字信息
            // console.log("=======files=======")
            // console.log(files);// 文件信息

            var file = files.filedata[0];
            // 读取文件
            var read = fs.createReadStream(file.path);
            // 写入到public里面的images里面
            var write = fs.createWriteStream(path.join(__dirname, '..', 'public', 'images', file.originalFilename))
                // 管道流
            read.pipe(write);
            write.on('close', () => {
                // 
                res.json({ err: 0, msg: '/images/' + file.originalFilename })
            })
        }
    });
})



module.exports = router;