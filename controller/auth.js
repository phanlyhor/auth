const connectionDB = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const homepage = (req, res) => {
    // Check if the user is authenticated (has a token)
    const hasToken = !!req.user; // `req.user` is set by the middleware

    // Pass `hasToken` to the EJS template
    res.render('page/homepage', { hasToken });
};

const about_us = (req , res) =>{
    res.render('page/about_us')
}

const signup = (req, res) => {
    res.render('auth/singup')
};

const post_signup = async (req, res) => {
    let body = req.body; // Corrected typo here

    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(body.password , salt)
    console.log(hashPassword)
    let myArr = [body.fullname, body.email, hashPassword];
    let sql = 'INSERT INTO `userauth`(`fullname`, `email`, `password`) VALUES (?, ?, ?)';

    connectionDB.query(sql, myArr, (err, data) => {
        if (err) {
            console.log(err);
        }
        console.log('insert success');
        res.redirect('/')
    });
};

const signin = (req, res) => {
    res.render('auth/singin')
};

const generateToken = (id) =>{
    return jwt.sign({id} , 'phanlyhor' , { expiresIn: '1h' })
}

const post_singin = (req , res) =>{
    console.log(req.body)

    let sql = 'select * from userauth where email = ?'

    connectionDB.query(sql , req.body.email , async (err , data) =>{
        if(err){
            console.log(err)
        }

        if(data.length == 0){
            res.send('invalid email')
        }

        const comparePassword = await bcrypt.compare(req.body.password , data[0].password )
        // console.log(comparePassword)
        if (comparePassword){
            const token = generateToken(data[0].id)
            res.cookie('jwt' , token , { maxAge: 12 * 60 * 60 * 1000, httpOnly: true })
            res.redirect('/');
            // console.log(token)
        }
    })
}

const forgot_password = (req, res) => {
    res.render('auth/forgetpass')
};

const logout = (req, res) => {
    res.cookie('jwt' , '' , {maxAge: 1})
    res.redirect('/signin')
};

module.exports = {
    homepage,
    about_us,
    signup,
    post_signup,
    signin,
    post_singin,
    forgot_password,
    logout
}