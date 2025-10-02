const Task = require('../models/taskModel');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('GET TASKS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};


const createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Please add a title' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('CREATE TASK ERROR:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};


const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };