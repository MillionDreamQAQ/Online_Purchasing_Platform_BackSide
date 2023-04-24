const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Quotation } = require('../model/quotation');
const { Template } = require('../model/template');
const { User } = require('../model/user');
const { ReceivedQuotation } = require('../model/receivedQuotation');
const { FinishedQuotation } = require('../model/finishedQuotation');

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

    if (!user) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

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

    const quotation = await Quotation.findById(id)
        .populate('template')
        .populate('selectedTemplate');

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

    if (quotation.publishedLocked === true) {
        res.send({
            code: 400,
            msg: '报价单已发布，不可再次编辑'
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

    if (!user) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

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

            if (currentQuotation.publishedLocked === true) {
                res.send({
                    code: 400,
                    msg: '报价单已发布，不可删除'
                });
                return;
            }

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
    const { quotationId, targetUsersId } = req.body;
    const publisherId = req.cookies.userId;

    const currentUserId = req.cookies.userId;

    const user = await User.findById(currentUserId);

    if (!user) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    if (valid(req.cookies.token, user.username) === false) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
        res.send({
            code: 400,
            msg: '报价单不存在'
        });
        return;
    }

    if (quotation.publishedLocked === true) {
        res.send({
            code: 400,
            msg: '报价单已发布，不可重复发布'
        });
        return;
    } else {
        quotation.publishedLocked = true;
        await quotation.save();
    }

    const users = await User.find({
        _id: {
            $in: targetUsersId
        }
    });

    if (!users) {
        res.send({
            code: 400,
            msg: '用户不存在'
        });
        return;
    }

    for (const user of users) {
        const lastReceivedQuotation = await ReceivedQuotation.findOne().sort({ key: -1 });

        const receivedQuotation = await ReceivedQuotation.create({
            key: lastReceivedQuotation ? parseInt(lastReceivedQuotation.key) + 1 : 1,
            quotation: quotation,
            publisher: publisherId,
            receiver: user._id
        });

        user.receivedQuotations.push(receivedQuotation._id);

        await user.save();
    }

    res.send({
        code: 200,
        msg: '发布成功'
    });
});

router.post('/deleteReceived', async (req, res, next) => {
    const { receivedQuotationId } = req.body;

    const userId = req.cookies.userId;

    const user = await User.findById(userId);

    if (!user) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    if (valid(req.cookies.token, user.username) === false) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    for (const receivedQuotation of user.receivedQuotations) {
        if (receivedQuotation._id.toString() === receivedQuotationId) {
            const currentReceivedQuotation = await ReceivedQuotation.findById(receivedQuotationId).populate('quotation');
            if (!currentReceivedQuotation) {
                res.send({
                    code: 400,
                    msg: '报价单不存在'
                });
                return;
            }
            
            if (currentReceivedQuotation.quotation.finishedLocked === true) {
                res.send({
                    code: 400,
                    msg: '报价单已完成报价，不可拒绝报价'
                });
                return;
            }

            user.receivedQuotations.remove(receivedQuotation);
            await ReceivedQuotation.findByIdAndDelete(receivedQuotationId);
            break;
        }
    }

    const newUser = await user.save();

    if (newUser) {
        res.send({
            code: 200,
            msg: '拒绝成功'
        });
    }
});

router.post('/finished', async (req, res, next) => {
    const { username, quotation } = req.body;

    const currentUserId = req.cookies.userId;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    if (valid(req.cookies.token, currentUser.username) === false) {
        res.send({
            code: 400,
            msg: 'token验证失败'
        });
        return;
    }

    const targetUser = await User.findOne({
        username
    });

    if (!targetUser) {
        res.send({
            code: 400,
            msg: '目标用户不存在'
        });
        return;
    }

    const reqQuotation = await Quotation.findById(quotation._id);
    if (!reqQuotation) {
        res.send({
            code: 400,
            msg: '报价单不存在'
        });
        return;
    }

    if (reqQuotation.finishedLocked === true) {
        res.send({
            code: 400,
            msg: '报价单已完成报价，不可重复报价'
        });
        return;
    } else {
        reqQuotation.finishedLocked = true;
        await reqQuotation.save();
    }

    const tempFinishedQuotation = await FinishedQuotation.findOne().sort({ key: -1 });

    const finishedQuotation = await FinishedQuotation.create({
        key: tempFinishedQuotation ? parseInt(tempFinishedQuotation.key) + 1 : 1,
        publisher: currentUserId,
        receiver: targetUser._id,
        quotation: quotation
    });

    targetUser.finishedQuotations.push(finishedQuotation._id);

    await targetUser.save();

    res.send({
        code: 200,
        msg: '报价成功'
    });
});

module.exports = router;
