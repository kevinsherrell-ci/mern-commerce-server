const express = require('express');
const router = express.Router();

const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const jwt = require('jsonwebtoken');

const Order = () => db().collection('orders');

router.post('/create', async (req, res)=>{
    const order = {
        _id: uuid(),
        user_id: req.body.user_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
        dateCreated: new Date(),
        dateModified: null
    }
    try{
        const createOrder = await Order().insertOne(order);
        res.json({
            success: true,
            result: createOrder
        })
    }catch(errors){
        res.json({
            success: false,
            errors: errors
        })
    }
})


module.exports = router;
