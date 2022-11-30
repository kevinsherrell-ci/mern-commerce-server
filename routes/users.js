const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const {db} = require('../Mongo');
const {uuid} = require('uuidv4');
const {validateUser} = require('../Validation/users');
const jwt = require('jsonwebtoken');

const User = () => db().collection('users');



router.get('/find',  async (req, res) => {
    if(Object.keys(req.query).length === 0){
        return res.json({
            success: false,
            message: "must provide a query"
        })
    }
    console.log(req.query);

    //
    const foundUser = await User().findOne({email: req.query.email});
    console.log(foundUser);
    if (foundUser === null) {
        return res.json({
            success: false,
            message: "user does not exist"
        })
    }
    res.json({
        success: true,
        result: foundUser
    })
})
router.get('/verify', (req, res) => {
    const token = req.header(process.env.TOKEN_HEADER_KEY);

    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (verified === null) {
        res.json({
            success: false,
            message: 'ID token could not be verified'
        })
    }

    res.json({
        success: true,
        message: "Token verified"
    })
})
/* POST create user*/
router.post('/register', async (req, res) => {
    console.log("/register");
    let hashed;
    const userObj = {
        email: req.body.email,
        password: req.body.password,
        verify: req.body.verify
    }
    console.log("user object", userObj);
    const validated = validateUser(userObj);
    //
    try {

        const userFound = await User().findOne({email: userObj.email});
        if (userFound !== null) {
            return res.json({
                success: false,
                message: 'Email already exists, please try another email'
            })
        }

        if (validated.isValid) {
            hashed = await bcrypt.hash(userObj.password, saltRounds);
            userObj.password = hashed;
        }
        // else {
        //     throw new Error("error");
        // }

        User().insertOne(
            {
                _id: uuid(),
                email: userObj.email,
                password: userObj.password
            }
        ).then(result => {
            res.json({
                success: true,
                result: result
            })
        })

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            isValid: validated.isValid,
            errors: validated.errors
        })
    }


})

/* POST login user*/
router.post('/login', async (req, res) => {
    console.log("/login");

    const errors = [];

    const secretKey = process.env.JWT_SECRET_KEY;
    const foundUser = await User().findOne({email: req.body.email});

    if (foundUser === null) {
        errors.push({
            type: "user",
            message: "This email does not exist"
        })
    }

    const userData = {
        date: new Date(),
        id: foundUser._id,
        // scope: foundUser.email.includes("codeimmersives.com") ? 'admin' : 'user'
    }

    const payload = {
        userData: userData,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    try {
        bcrypt.compare(req.body.password, foundUser.password)
            .then(result => {
                if (result === true) {
                    const token = jwt.sign(payload, secretKey);
                    return res.json({
                        success: true,
                        token: token,
                        email: foundUser.email
                    })
                } else {
                    errors.push({
                        type: 'user',
                        message: "email or password invalid"
                    })
                    return res.json({
                        success: false,
                        errors: errors
                    })
                }
            })
    } catch (err) {
        res.send({
            success: false,
            message: err
        })
    }

})
/* GET users listing. */
router.get('/:id', async (req, res, next) => {
    console.log("id router is running")
    const foundUser = await User().findOne({_id: req.params.id});
    if (foundUser === null) {
        return res.json({
            success: false,
            message: "user does not exist"
        })
    }
    res.json({
        success: true,
        result: {
            _id: foundUser._id,
            email: foundUser.email,
        }
    })
});
module.exports = router;
