const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Quotation } = require('../../model/new/quotation');
const { Template } = require('../../model/new/template');
const { User } = require('../../model/new/user');

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

router.post('/add', async (req, res, next) => {
    const { quotationName, template } = req.body;

    const userId = req.cookies.userId;

    const user = await User.findById(userId);

    if (valid(req.cookies.token, user.username) === false) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    let templateRes = [];
    try {
        for (const item of template) {
            const lastTemplate = await Template.findOne().sort({ key: -1 });

            const template = await Template.create({
                key: lastTemplate ? parseInt(lastTemplate.key) + 1 : 1,
                name: item.name,
                size: item.size,
                unit: item.unit,
                desc: item.desc
            });
            templateRes.push(template._id);
        }
    } catch {
        res.send({
            code: 400,
            msg: '配置项Id重复，模板添加失败'
        });
        return;
    }

    const lastQuotation = await Quotation.findOne().sort({ key: -1 });

    const quotation = await Quotation.create({
        key: lastQuotation ? parseInt(lastQuotation.key) + 1 : 1,
        quotationName,
        template: templateRes
    });

    if (!quotation) {
        res.send({
            code: 400,
            msg: '报价单Id重复，报价单添加失败'
        });
        return;
    }

    user.quotations.push(quotation._id);

    const newUser = await user.save();

    if (newUser) {
        res.send({
            code: 200,
            msg: '添加成功'
        });
    }
});

router.get('/findById', async (req, res, next) => {
    const { id } = req.query;

    const quotation = await Quotation.findById(id).populate('template');

    res.send({
        code: 200,
        data: quotation
    });
});

router.post('/setSelectedTemplate', async (req, res, next) => {
    const { quotationId, selectedTemplateKey } = req.body;

    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
        res.send({
            code: 400,
            msg: '报价单不存在'
        });
        return;
    }

    const selectedTemplateId = [];

    for (const key of selectedTemplateKey) {
        const template = await Template.findOne({
            key
        });
        selectedTemplateId.push(template._id);
    }

    quotation.selectedTemplate = selectedTemplateId;

    const newQuotation = await quotation.save();

    if (newQuotation) {
        res.send({
            code: 200,
            msg: '设置成功'
        });
    }
});

router.post('/delete', async (req, res, next) => {
    const { quotationId } = req.body;

    const userId = req.cookies.userId;

    const user = await User.findById(userId);

    if (valid(req.cookies.token, user.username) === false) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    for (const quotation of user.quotations) {
        if (quotation._id.toString() === quotationId) {
            const currentQuotation = await Quotation.findById(quotationId);

            for (const template of currentQuotation.template) {
                await Template.deleteOne({
                    _id: template._id
                });
            }

            user.quotations.remove(quotation);

            await Quotation.findByIdAndDelete(quotationId);

            break;
        }
    }

    const newUser = await user.save();

    if (newUser) {
        res.send({
            code: 200,
            msg: '删除成功'
        });
    }
});

router.post('/publish', async (req, res, next) => {
    const { quotationId, usersId } = req.body;

    console.log(quotationId, usersId);

    const quotation = await Quotation.findById(quotationId);

    console.log(quotation);

    if (!quotation) {
        res.send({
            code: 400,
            msg: '报价单不存在'
        });
        return;
    }

    const users = await User.find({
        _id: {
            $in: usersId
        }
    });

    console.log(users);

    if (!users) {
        res.send({
            code: 400,
            msg: '用户不存在'
        });
        return;
    }

    for (const user of users) {
        if (user.receivedQuotations.includes(quotation._id)) {
            continue;
        }
        user.receivedQuotations.push(quotation._id);
        await user.save();
    }

    res.send({
        code: 200,
        msg: '发布成功'
    });
});

module.exports = router;
