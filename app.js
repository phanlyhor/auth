const express = require('express');
const app = express();
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const checkUser = require('./middleware/auth')

// Middleware to parse JSON bodies
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('*' , checkUser.checkUser)
// Use the routes
app.use(auth);

app.listen(8000, () => {
    console.log('http://localhost:8000');
});