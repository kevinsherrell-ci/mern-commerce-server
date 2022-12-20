const express = require('express');
const router = express.Router();
const axios = require('axios');
const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const {MaxKey, ObjectId} = require("mongodb");


const Product = () => db().collection('products');

router.post('/seed', async (req, res) => {
    try {
        const products = await axios.get("http://makeup-api.herokuapp.com/api/v1/products.json");
        if (products.data) {
            products.data.map(product => {
                // convert price string to double/float
                if (product.price === "" || product.price === "0.0") {
                    product.price = 5;
                } else {
                    product.price = parseFloat(product.price);
                }
                // remove id field
                delete product.id;
            })
        }
        const insertAll = await Product().insertMany(products.data);
        console.log(insertAll);
        res.status(200)
            .json({
                success: true,
                data: products.data
            })
    } catch (err) {
        res.status(500)
            .json({
                success: false,
                error: err.message
            })
    }
})
router.put('/field/remove/:name', async (req, res) => {
    try {
        let field = {};
        field[req.params.name] = "";
        const remove = await Product().updateMany({}, {$unset: field});
        res.status(200)
            .json({
                success: true,
                data: remove
            })
    } catch (err) {
        res.status(500)
            .json({
                success: false,
                error: err.message
            })
    }

})

router.get('/find', async (req, res) => {
    // previous page - less than the first id
    // next page - greater than last id
    const productList = [];
    let firstId = req.body.first_id && ObjectId(req.body.first_id);
    let lastId = req.body.last_id && ObjectId(req.body.last_id);
    const back = req.body.previous_page || false;
    const next = req.body.next_page || false;

    const getPage = () => {
        const queryObject = {};
        if (lastId && next) Object.assign(queryObject, {_id: {$gt: lastId}});
        if (firstId && back) Object.assign(queryObject, {_id: {$lt: firstId}});

        return queryObject;
    }

    const query = {...getPage()};
    if (Object.keys(req.query).length > 0) {
        Object.assign(query, req.query);
    }
    try{

    }catch(err){
        res.status(500)
            .json({
                success: true,
                error: err.message
            })
    }
    const cursor = await Product().find(query).sort({_id: 1}).limit(20);
    await cursor.forEach(product => {
        productList.push(product);
        lastId = product._id;
    })
    if (productList.length !== 0) {
        res.status(200)
            .json({
                success: true,
                data: productList,
                first: productList.length > 0 ? productList[0]._id : "",
                last: lastId,
                count: productList.length
            })
    }

})
module.exports = router;

// possible pagination solution
/*
* Query for all document _ids when application loads.
* Document ids saved to array on front end.
* divide amount of documents by 20. This will be the number of pages.
* each page should have an object that includes first ID and lastID
* */