// const express = require('express');
// const router = express.Router();
// const {
//     registerUser,
//     loginUser,
//     getUserProfile,
//     updateUserProfile,
//     forgotPassword,
// } = require('../controllers/userController');
// const { protect } = require('../middleware/authMiddleware');

// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.post('/forgot-password', forgotPassword);


// router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    resetPassword,
    forgotPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.route('/register').post(registerUser).options((req, res) => res.sendStatus(204));
router.route('/login').post(loginUser).options((req, res) => res.sendStatus(204));
router.route('/forgot-password').post(forgotPassword).options((req, res) => res.sendStatus(204));
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile).options((req, res) => res.sendStatus(204));

module.exports = router;
