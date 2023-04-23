const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../model/user');
const { Quotation } = require('../model/quotation');
const { ReceivedQuotation } = require('../model/receivedQuotation');

const saltRounds = 10;

function valid(cookie, username) {
    return bcrypt.compareSync(username, cookie, function (err, result) {
        if (err) {
            console.error('比对失败', err);
            return false;
        }
        if (result === true) {
            console.log('密码匹配');
            return true;
        } else {
            console.log('密码不匹配');
            return false;
        }
    });
}

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
        bcrypt.hash(username, saltRounds, function (err, hash) {
            if (err) {
                console.error('Token生成失败', err);
            }

            res.cookie('username', username, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: false
            });

            res.cookie('userId', user._id.toString(), {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true
            });

            res.cookie('token', hash, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true
            });

            res.send({
                code: 200,
                msg: '登录成功'
            });
        });
    }
});

router.get('/findById', async (req, res, next) => {
    let index = 0;
    let result;

    const id = req.cookies.userId;
    const user = await User.findById(id).populate('quotations').populate('receivedQuotations');

    if (valid(req.cookies.token, user.username) === false) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    result = user;

    const quotations = user.quotations;
    for (const quotation of quotations) {
        const resQuotation = await Quotation.findById(quotation._id)
            .populate('template')
            .populate('selectedTemplate');
            
        result.quotations[index] = resQuotation;
        index++;
    }

    index = 0;
    const receivedQuotations = user.receivedQuotations;
    for (const receivedQuotation of receivedQuotations) {
        const resQuotation = await ReceivedQuotation.findById(receivedQuotation._id)
            .populate('publisher')
            .populate('receiver')
            .populate('quotation')
            
        result.receivedQuotations[index] = resQuotation;
        index++;
    }

    if (user) {
        res.send({
            code: 200,
            result
        });
    }
});

router.get('/listWithoutMe', async (req, res, next) => {
    const id = req.cookies.userId;

    const users = await User.find({
        _id: {
            $ne: id
        }
    });

    if (users) {
        res.send({
            code: 200,
            users
        });
    } else {
        res.send({
            code: 400,
            msg: '用户不存在'
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

router.get('/logout', async (req, res, next) => {
    res.clearCookie('username');
    res.clearCookie('userId');
    res.clearCookie('token');

    res.send({
        code: 200,
        msg: '退出成功'
    });
});

module.exports = router;
