const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const {validateUser} = require('../Validation/users');
const jwt = require('jsonwebtoken');

const User = () => db().collection('users');


router.post('/reconnect', (req, res) => {
        console.log(req.session);
        req.session.cookie.name = 'newCookie';
        try {
            if (req.session.currentUser === null || req.session.currentUser === undefined) {
                return res.status(400).json({
                    success: false,
                    error: [{
                        type: "auth",
                        message: "Session not found"
                    }]
                })
            }
            return res.status(200).json({
                success: true,
                data: req.session.currentUser
            });


        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    }
)
router.get('/find', async (req, res) => {
    try {
        if (Object.keys(req.query).length === 0) {
            return res.status(500).json({
                success: false,
                error: [{
                    type: "auth",
                    message: "must provide a query"
                }]
            })
        }

        const foundUser = await User().findOne({email: req.query.email});

        if (foundUser === null) {
            return res.status(400).json({
                success: false,
                message: "user does not exist"
            })
        }
        res.status(200).json({
            success: true,
            data: foundUser
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }

})

/* POST create user*/
router.post('/register', async (req, res) => {
    let hashed;
    const userObj = {
        email: req.body.email,
        password: req.body.password,
        verify: req.body.verify
    }
    const validated = validateUser(userObj);
    try {

        const userFound = await User().findOne({email: userObj.email});
        if (userFound !== null) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists, please try another email'
            })
        }
        if (!validated.isValid) {
            return res.status(500).json({
                success: false,
                error: validated.errors
            })
        }

        hashed = await bcrypt.hash(userObj.password, saltRounds);
        userObj.password = hashed;


        User().insertOne(
            {
                _id: uuid(),
                email: userObj.email,
                password: userObj.password
            }
        ).then(async result => {
            const newUser = await User().findOne({_id: result.insertedId});
            console.log(newUser);
            res.status(200).json({
                success: true,
                data: newUser
            })
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }


})

/* POST login user*/
router.post('/login', async (req, res) => {
    const errors = [];

    const foundUser = await User().findOne({email: req.body.email});
    if (foundUser === null) {
        errors.push({
            type: "user",
            message: "user does not exist"
        });
        return res.status(400).json({
            success: false,
            error: errors
        })
    }

    const userData = {
        id: foundUser._id,
        email: foundUser.email
    }

    try {
        bcrypt.compare(req.body.password, foundUser.password)
            .then(result => {
                if (result === true) {
                    req.session.currentUser = userData;
                    req.session.cookie.id = foundUser._id;

                    return res.status(200).json({success: true, data: userData});

                } else {
                    errors.push({
                        type: 'user',
                        message: "email or password invalid"
                    })
                    return res.status(500).json({
                        success: false,
                        error: errors
                    })
                }
            })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }

})
router.delete('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true
        }).json({
            success: true,
            message: "user is logged out"
        })
    })
})
/* GET users listing. */
router.get('/:id', async (req, res, next) => {
    const foundUser = await User().findOne({_id: req.params.id});
    if (foundUser === null) {
        return res.status(400).json({
            success: false,
            error: [{
                type: "auth",
                message: "user does not exist"
            }]
        })
    }
    res.status(200).json({
        success: true,
        result: {
            _id: foundUser._id,
            email: foundUser.email,
        }
    })
});
module.exports = router;
