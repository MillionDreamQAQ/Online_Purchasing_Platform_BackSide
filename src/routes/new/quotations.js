const express = require('express');
const router = express.Router();
const { Quotation } = require('../../model/new/quotation');
const { Template } = require('../../model/new/template');
const { User } = require('../../model/new/user');

router.post('/add', async (req, res, next) => {
    const { username, key, quotationName, template } = req.body;

    let templateRes = [];
    for (const item of template) {
        const template = await Template.create({
            key: item.key,
            name: item.name,
            size: item.size,
            unit: item.unit,
            desc: item.desc
        });
        templateRes.push(template._id);
    }

    console.log("templateRes", templateRes);

    const quotation = await Quotation.create({
        key,
        quotationName,
        template: templateRes
    });

    console.log("quotation", quotation);

    const user = await User.findOne({
        username
    });

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

module.exports = router;
