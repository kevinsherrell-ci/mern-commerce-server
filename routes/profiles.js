const express = require('express');
const router = express.Router();

const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const jwt = require('jsonwebtoken');

const Profile = () => db().collection('profiles');

router.get('/:id', async (req, res) => {
    try {
        const findProfile = await Profile().findOne({user_id: req.params.id});
        if (findProfile === null) {
            return res.status(400).json({
                success: false,
                error: [{
                    type: "profile",
                    message: "this profile does not exist"
                }]
            })
        }
        res.status(200).json({
            success: true,
            data: findProfile
        })
    } catch (errors) {
        res.status(500).json({
            success: false,
            error: errors
        })
    }
})

router.post('/create', async (req, res) => {
    const profile = {
        _id: uuid(),
        user_id: req.body.user_id,
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
        cart: {},
        favorites: [],
        active: false,
        dateCreated: new Date(),
        dateModified: null
    }
    try {
        Profile().insertOne(profile).then(response => {
            return res.status(200).json({
                success: true,
                data: profile
            })
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
})

router.put('/update/:id', async (req, res) => {
    const keys = ['_id', 'user_id', 'firstName', 'middleName', 'lastName', 'shippingAddress', 'billingAddress', 'cart', 'favorites', 'active', 'dateCreated', 'dateModified'];
    const errors = [];
    try {
        // temporary validation solution - move into separate module
        if (Object.keys(req.body).length === 0) {
            return res.status(500).json({
                success: false,
                error: "body is empty, no changes have been made"
            })
        }
        Object.keys(req.body).forEach(key => {
            if (!keys.includes(key)) {
                errors.push({
                    type: "profile",
                    message: `"${key}" is an invalid key, please remove and try again`
                })
            }
        })


        if (errors.length > 0) {
            return res.status(500).json({
                success: false,
                error: errors
            })
        }


        const updateProfile = await Profile().updateOne({_id: req.params.id}, {$set: req.body}, {upsert: true});
        const profile = await Profile().findOne({_id: req.params.id});
        return res.status(200).json({
            success: true,
            data: profile
        })
    } catch (err) {
        res.status(500).json({
            success: true,
            error: err.message
        })
    }
})

module.exports = router;
