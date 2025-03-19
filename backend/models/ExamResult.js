import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: mongoose.Schema.Types.ObjectId, required: true }
  }],
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ExamResult', examResultSchema);