const express = require('express');
const router = express.Router();
const { User } = require('../model/user');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        username
    });

    if (user) {
        res.send({
            code: 400,
            msg: '用户已存在'
        });
        return;
    }

    const newUser = await User.create({
        username,
        password
    });
    
    if (newUser) {
        res.send({
            code: 200,
            msg: '注册成功'
        });
    }
});

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        username
    }).select('+password');
    if (!user) {
        res.send({
            code: 400,
            msg: '用户不存在'
        });
    } else {
        if (bcrypt.compareSync(password, user.password)) {
            res.send({
                code: 200,
                msg: '登录成功'
            });
        } else {
            res.send({
                code: 400,
                msg: '密码错误'
            });
        }
    }
});

router.get('/info', async (req, res, next) => {
    const user = await User.findOne({
        _id: req.query.user_id
    });
    res.send({
        code: 200,
        data: user
    });
});

router.get('/list', async (req, res, next) => {
    const user = await User.find();
    res.send({
        code: 200,
        msg: '获取成功',
        data: user
    });
});

module.exports = router;
