// const express = require('express');
// const router = express.Router();
// const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
// const { protect } = require('../middleware/authMiddleware');

// router.route('/').get(protect, getTasks).post(protect, createTask);
// router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

// module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(express.json());
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

const validateId = (req, res, next) => {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    next();
};

router.route('/').get(protect, getTasks).post(protect, createTask);
router.put('/:id', protect, validateId, updateTask);
router.delete('/:id', protect, validateId, deleteTask);

module.exports = router;
