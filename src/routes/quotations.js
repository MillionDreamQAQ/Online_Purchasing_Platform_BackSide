const express = require('express');
const router = express.Router();
const { Quotation } = require('../model/quotation');

router.post('/add', async (req, res, next) => {
    const { quotationName, template } = req.body;
    const quotation = await Quotation.findOne({
        quotationName
    });
    if (quotation) {
        res.send({
            code: 400,
            msg: '报价单已存在'
        });
        return;
    }

    const newQuotation = await Quotation.create({
        quotationName,
        template
    });

    if (newQuotation) {
        res.send({
            code: 200,
            msg: '添加成功'
        });
    }
});

router.post('/templateSelect', async (req, res, next) => {
    const { quotationName, selectedTemplate } = req.body;
    const quotation = await Quotation.findOne({
        quotationName
    });
    if (!quotation) {
        res.send({
            code: 400,
            msg: '报价单不存在'
        });
        return;
    }
    quotation.selectedTemplate = selectedTemplate;
    const newQuotation = await quotation.save();
    if (newQuotation) {
        res.send({
            code: 200,
            msg: '添加成功'
        });
    }
});

router.get('/list', async (req, res, next) => {
    const quotations = await Quotation.find({}).select('-__v-_id');
    res.send({
        code: 200,
        data: quotations
    });
});

module.exports = router;
