const express = require('express');
const router = express.Router();

const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const jwt = require('jsonwebtoken');

const Order = () => db().collection('orders');

router.get('/create', async (req, res)=>{
    const order = {
        _id: uuid(),
        user: req.body.id,
        productID: req.body.productID,
        quantity: req.body.quantity,
    }
    try{

    }catch(errors){
        res.json({
            success: false,
            errors: errors
        })
    }
})


module.exports = router;
