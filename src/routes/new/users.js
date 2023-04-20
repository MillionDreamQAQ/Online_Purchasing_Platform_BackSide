const express = require('express');
const router = express.Router();
const { User } = require('../../model/new/user');

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
    } else {
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
    }
});

router.get('/list', async (req, res, next) => {
    const users = await User.find();

    if (users) {
        res.send({
            code: 200,
            users
        });
    }
});

module.exports = router;
