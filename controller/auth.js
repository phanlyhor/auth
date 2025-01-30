const connectionDB = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Function to generate a unique token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Homepage Controller
const homepage = (req, res) => {
    const hasToken = !!req.user; // Check if the user is authenticated
    res.render('page/homepage', { hasToken });
};

// About Us Controller
const about_us = (req, res) => {
    res.render('page/about_us');
};

// Signup Page Controller
const signup = (req, res) => {
    res.render('auth/signup');
};

// Handle User Signup
const post_signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO `userauth`(`fullname`, `email`, `password`) VALUES (?, ?, ?)';
        connectionDB.query(sql, [fullname, email, hashPassword], (err) => {
            if (err) throw err;
            console.log('User registered successfully');
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('An error occurred during registration.');
    }
};

// Signin Page Controller
const signin = (req, res) => {
    res.render('auth/signin');
};

// Handle User Signin
const post_singin = (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM userauth WHERE email = ?';
    connectionDB.query(sql, email, async (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred');
        }

        if (data.length === 0) {
            return res.status(400).send('Invalid email or password');
        }

        const user = data[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id }, 'phanlyhor', { expiresIn: '12h' });
        res.cookie('jwt', token, { maxAge: 12 * 60 * 60 * 1000, httpOnly: true });
        res.redirect('/');
    });
};

// Forgot Password Page
const forgot_password = (req, res) => {
    res.render('auth/forgetpass');
};

// Handle Password Reset Request
const reset_password = async (req, res) => {
    const { email } = req.body;

    try {
        // Generate reset token and expiration time
        const resetToken = generateToken();
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        // Store reset token and expiry in database
        const sql = 'UPDATE userauth SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?';
        connectionDB.query(sql, [resetToken, resetTokenExpiry, email], async (err, result) => {
            if (err) throw err;

            if (result.affectedRows === 0) {
                return res.status(404).send('Email not found');
            }

            const resetLink = `http://localhost:8000/reset-password/${resetToken}`;
            const transporter = nodemailer.createTransport({
                service: 'gmail', // or another email service like Yahoo, Outlook, etc.
                auth: {
                    user: process.env.EMAIL_USER, // Your email from .env
                    pass: process.env.EMAIL_PASS, // Your password from .env
                },
            });
            
            const mailOptions = {
                from: `"Your App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Password Reset Request',
                html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                       <a href="${resetLink}">${resetLink}</a>`,
            };

            await transporter.sendMail(mailOptions);
            res.send('Password reset email sent. Please check your inbox.');
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).send('Failed to send password reset email');
    }
};

// Validate Reset Token
const validate_reset_token = (req, res) => {
    const { token } = req.params;

    const sql = 'SELECT * FROM userauth WHERE resetToken = ? AND resetTokenExpiry > ?';
    connectionDB.query(sql, [token, Date.now()], (err, data) => {
        if (err || data.length === 0) {
            return res.status(400).send('Invalid or expired token');
        }

        res.render('auth/reset_password', { token });
    });
};

// Update Password
const update_password = async (req, res) => {
    const { token, newPassword } = req.body;

    const sql = 'SELECT * FROM userauth WHERE resetToken = ? AND resetTokenExpiry > ?';
    connectionDB.query(sql, [token, Date.now()], async (err, data) => {
        if (err || data.length === 0) {
            return res.status(400).send('Invalid or expired token');
        }

        const user = data[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updateSql = 'UPDATE userauth SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?';
        connectionDB.query(updateSql, [hashedPassword, user.id], (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send('Failed to update password');
            }

            res.send('Password updated successfully');
        });
    });
};

// Logout
const logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/signin');
};

module.exports = {
    homepage,
    about_us,
    signup,
    post_signup,
    signin,
    post_singin,
    forgot_password,
    reset_password,
    validate_reset_token,
    update_password,
    logout,
};
