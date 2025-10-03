const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(express.json());

const validateId = (req, res, next) => {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    next();
};

router.route('/').get(protect, getTasks).post(protect, createTask);
router.put('/:id', protect, validateId, updateTask);
router.delete('/:id', protect, validateId, deleteTask);

module.exports = router;
