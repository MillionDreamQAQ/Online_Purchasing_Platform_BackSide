const express = require('express');
const router = express.Router();
const { User } = require('../../model/new/user');
const { Quotation } = require('../../model/new/quotation');

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
    }

    const isPasswordValid = require('bcrypt').compareSync(password, user.password);

    if (!isPasswordValid) {
        res.send({
            code: 400,
            msg: '密码错误'
        });
    } else {
        res.send({
            code: 200,
            msg: '登录成功'
        });
    }
});

router.get('/findById', async (req, res, next) => {
    let index = 0;
    let result;

    const { id } = req.query;

    const user = await User.findById(id).populate('quotations');
    result = user;

    const quotations = user.quotations;
    for (const quotation of quotations) {
        const resQuotation = await Quotation.findById(quotation._id).populate('template');

        result.quotations[index] = resQuotation;
        index++;
    }

    if (user) {
        res.send({
            code: 200,
            result
        });
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
