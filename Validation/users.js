const {isEmpty} = require('./isEmpty');

const addError = (type, message, arr) => {
    arr.push({
        type: type,
        message: message
    })
}


const validateUser = (obj) => {
    const errors = [];

    if (isEmpty(obj)) {
        console.log("obj", obj);
        addError('user', 'user object cannot be empty', errors);
        return {
            isValid: false,
            errors: errors
        }
    }

    let domain;

    // email validation
    if (isEmpty(obj.email)) {
        addError('email', 'email must not be empty', errors);
    } else if (typeof obj.email === 'string') {
        if (obj.email.match(/@/g).length === 1) {
            const start = obj.email.indexOf("@") + 1;
            const end = obj.email.length;
            domain = obj.email.slice(start, end);
        }
    }

    console.log(obj.email.match(/@/g).length);
    if (typeof obj.email !== 'string') {
        addError('email', 'email must be a string', errors);
    } else if (obj.email.match(/@/g).length < 1 || obj.email.match(/@/g).length > 1) {
        addError('email', 'email must include 1 @ symbol');
    } else if (!domain.includes('.')) {
        addError("email", 'domain must contain a period "." ', errors);
    }

    // email must contain 1 @ symbol
    // starting from the @ symbol the email must include 1 period '.'


    // password validation
    if (isEmpty(obj.password)) {
        addError('password', 'password must not be empty', errors);
    }
    if (typeof obj.password !== 'string') {
        addError('password', 'password must be a string', errors);
    }


    // verify validation
    if (isEmpty(obj.verify)) {
        addError('verify', 'must verify your password', errors);
    }
    if (typeof obj.verify !== 'string') {
        addError("verify", 'verify  must be a string', errors);
    }
    if (obj.password !== obj.verify) {
        addError("password/verify", 'password and verify must match', errors);
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            errors: errors
        }
    }
    return {
        isValid: true
    }
}

module.exports = {
    validateUser
}
