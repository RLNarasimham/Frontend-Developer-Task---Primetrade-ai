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
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

router.route('/register').post(registerUser).options((req, res) => res.sendStatus(204));
router.route('/login').post(loginUser).options((req, res) => res.sendStatus(204));
router.route('/forgot-password').post(forgotPassword).options((req, res) => res.sendStatus(204));
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile).options((req, res) => res.sendStatus(204));

module.exports = router;
