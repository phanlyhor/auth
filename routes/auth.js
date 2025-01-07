const express = require('express');
const authController = require('../controller/auth');
const Middleware = require('../middleware/auth')
const router = express.Router();


router.get('/' , authController.homepage)

router.get('/about_us', Middleware.requireAuth, authController.about_us)

router.get('/signup', authController.signup);
router.post('/signup', authController.post_signup);

router.get('/signin', authController.signin);
router.post('/signin', authController.post_singin);

router.get('/forgot-password', authController.forgot_password);

router.get('/Logout', authController.logout);

module.exports = router;