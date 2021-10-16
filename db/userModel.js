const mongoose = require('mongoose')

// 定义user集合的数据格式要求
const userSchema = mongoose.Schema({
    username: String,
    password: String,
    creatTime: Number
})

// 创建一个 users 集合
const userModel = mongoose.model('users', userSchema)

// 导出
module.exports = userModel