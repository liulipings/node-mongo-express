const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost:27017/articleM')
const db = mongoose.connection

// 监听事件，判断数据库是否链接成功
db.on('error', () => {
    console.log('连接数据库失败');
})

db.once('open', () => {
    console.log('数据库连接成功');
})


// 导出
module.exports = { db }