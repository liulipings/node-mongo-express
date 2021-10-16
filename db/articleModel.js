const mongoose = require('mongoose')

// 定义article集合的数据格式要求
const articleSchema = mongoose.Schema({
    title: String,
    content: String,
    username: String,
    creatTime: Number
})

// 创建一个 article 集合
const articleModel = mongoose.model('articles', articleSchema)

// 导出
module.exports = articleModel