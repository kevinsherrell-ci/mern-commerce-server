const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const {db} = require('../mongo');
const {uuid} = require('uuidv4');
const {validateUser} = require('../validation/user');
const jwt = require('jsonwebtoken');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/message', (req, res) => {
  const token = req.header(process.env.TOKEN_HEADER_KEY);
  console.log(token);
  const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (verified === null) {
    res.json({
      success: false,
      message: 'ID token could not be verified'
    })
  }
  if (verified && verified.userData.scope === 'user') {
    res.json({
      success: true,
      message: "I am a user"
    });
  } else if (verified && verified.userData.scope === 'admin') {
    res.json({
      success: true,
      message: "I am an admin"
    })
  }
  console.log(verified);
})
/* POST create user*/
router.post('/register', async (req, res) => {
  console.log("create has been called");
  let hashed;
  const userObj = {
    email: req.body.email,
    password: req.body.password,
    verify: req.body.verify
  }
  // validate that user object is correct
  console.log("user object", userObj);
  // console.log("req.body", req.body);
  const validated = validateUser(userObj);
  //
  try {
    const userFound = await db().collection('users').findOne({email: userObj.email});
    if (userFound !== null) {
      return res.json({
        success: false,
        message: 'this email exists'
      })
    }

    if (validated.isValid) {
      hashed = await bcrypt.hash(userObj.password, saltRounds);
      userObj.password = hashed;
    } else {
      throw new Error("error");
    }
    console.log("req.body",req.body);

    db().collection('users').insertOne(
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

  const secretKey = process.env.JWT_SECRET_KEY;
  console.log("loggin running");
  const foundUser = await db().collection('users').findOne({email: req.body.email});
  const userData = {
    date: new Date(),
    id: foundUser._id,
    scope: foundUser.email.includes("codeimmersives.com") ? 'admin' : 'user'
  }
  const payload = {
    userData: userData,
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  };

  bcrypt.compare(req.body.password, foundUser.password)
      .then(result => {
        if (result === true) {
          const token = jwt.sign(payload, secretKey);


          res.json({
            success: true,
            token: token,
            email: foundUser.email
          })
        } else {
          res.json({
            success: false
          })
        }
      })
      .catch(err => {
        res.send({
          success: false,
          message: err
        })
      })
})

module.exports = router;
