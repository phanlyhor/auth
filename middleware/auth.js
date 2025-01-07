const jwt = require('jsonwebtoken')
const connectionDB = require('../config/db')


const requireAuth = (req , res , next) =>{
    const token = req.cookies.jwt
    console.log(`token in middlewate ${token}`)
    if(token){
        jwt.verify(token, 'phanlyhor' , (err , decodedToken) =>{
            if(err) {
                console.log(err)
            }
            else{
                console.log(decodedToken)
            }
        })
        next()
    }else{
        res.redirect('/signin')
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt; // 1. យក token ពី cookie
    if (token) {
        // 2. ផ្ទៀងផ្ទាត់ token
        jwt.verify(token, 'phanlyhor', (err, decodedToken) => {
            if (err) {
                // Token មិនត្រឹមត្រូវ
                res.locals.user = null;
                return res.redirect('/signin'); // បញ្ជូនអ្នកប្រើទៅ "/signin"
            } else {
                // Token ត្រឹមត្រូវ -> ទាញយកព័ត៌មានអ្នកប្រើពី Database
                connectionDB.query(
                    'SELECT * FROM userauth WHERE id = ?', 
                    [decodedToken.id], // id របស់អ្នកប្រើ
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            res.locals.user = null;
                        } else {
                            // បញ្ចូលព័ត៌មានអ្នកប្រើចូល res.locals.user
                            res.locals.user = data.length > 0 ? data[0] : null;
                        }
                        next(); // បន្តទៅ middleware ឬ route បន្ទាប់
                    }
                );
            }
        });
    } else {
        // មិនមាន token
        res.locals.user = null;
        next(); // បន្តដំណើរការ
    }
};

module.exports = {
    requireAuth,
    checkUser
}