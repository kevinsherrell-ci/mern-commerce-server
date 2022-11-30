const express = require('express');
const router = express.Router();

const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const jwt = require('jsonwebtoken');

const Profile = () => db().collection('profiles');

router.get('/create', async (req, res) => {
    const profile = {
        _id: uuid(),
        user: req.body.id,
        firstName: "",
        middleName: "",
        lastName: "",
        shippingAddress: {
            address: "",
            address2: "",
            city: "",
            state: "",
            zip: ""
        },
        billingAddress: {
            address: "",
            address2: "",
            city: "",
            state: "",
            zip: ""
        },
        cart: [],
        favorites: [],
        active: false,
        dateCreated: new Date(),
        dateModified: null
    }
    try {
        const profileCreated = await Profile().insertOne(profile);
        res.json({
            success: true,
            result: profileCreated
        })
    } catch (errors) {
        res.json({
            success: false,
            errors: errors
        })
    }
})


module.exports = router;
