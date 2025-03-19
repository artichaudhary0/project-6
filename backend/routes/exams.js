import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';

const router = express.Router();

// Create exam (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const exam = new Exam({
      ...req.body,
      createdBy: req.user._id
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all exams
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit exam
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const { answers } = req.body;
    let correctAnswers = 0;

    answers.forEach(answer => {
      const question = exam.questions.id(answer.question);
      const selectedOption = question.options.id(answer.selectedOption);
      if (selectedOption && selectedOption.isCorrect) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / exam.questions.length) * 100;
    const passed = score >= 50;

    const result = new ExamResult({
      student: req.user._id,
      exam: exam._id,
      answers,
      score,
      passed
    });

    await result.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;