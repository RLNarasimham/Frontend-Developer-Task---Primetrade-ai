const Task = require('../models/taskModel');
const mongoose = require('mongoose');

const getTasks = async (req, res) => {
  try {
    // Add pagination and sorting for better performance
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Returns plain JavaScript objects for better performance

    const total = await Task.countDocuments({ user: req.user.id });

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total
    });
  } catch (error) {
    console.error('GET TASKS ERROR:', error);
    res.status(500).json({
      message: 'Server error fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    // Enhanced validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: 'Title cannot exceed 200 characters' });
    }

    // Validate status and priority if provided
    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'pending',
      priority: priority || 'medium',
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('CREATE TASK ERROR:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Server error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateTask = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Validate incoming data
    const { title, status, priority } = req.body;

    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    if (title && title.length > 200) {
      return res.status(400).json({ message: 'Title cannot exceed 200 characters' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    // Sanitize data
    const updateData = { ...req.body };
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.description) updateData.description = updateData.description.trim();

    // Prevent user from being changed
    delete updateData.user;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Server error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({
      message: 'Task deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    res.status(500).json({
      message: 'Server error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };