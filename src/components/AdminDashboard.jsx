import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    duration: 30,
    questions: [{ question: '', options: [{ text: '', isCorrect: false }] }]
  });
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/exams', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5001/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setExams(examsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/exams', examForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExamForm({
        title: '',
        description: '',
        duration: 30,
        questions: [{ question: '', options: [{ text: '', isCorrect: false }] }]
      });
      fetchData();
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const addQuestion = () => {
    setExamForm({
      ...examForm,
      questions: [...examForm.questions, { question: '', options: [{ text: '', isCorrect: false }] }]
    });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...examForm.questions];
    newQuestions[questionIndex].options.push({ text: '', isCorrect: false });
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const handleQuestionChange = (questionIndex, value) => {
    const newQuestions = [...examForm.questions];
    newQuestions[questionIndex].question = value;
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...examForm.questions];
    newQuestions[questionIndex].options[optionIndex][field] = value;
    setExamForm({ ...examForm, questions: newQuestions });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Exam</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={examForm.description}
              onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={examForm.duration}
              onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              required
              min="1"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Questions</h3>
            {examForm.questions.map((question, qIndex) => (
              <div key={qIndex} className="mb-6 p-4 border rounded">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Question {qIndex + 1}</label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">Options</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                        className="flex-1 p-2 border rounded mr-2"
                        required
                      />
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={option.isCorrect}
                          onChange={() => {
                            const newQuestions = [...examForm.questions];
                            newQuestions[qIndex].options.forEach((opt, i) => {
                              opt.isCorrect = i === oIndex;
                            });
                            setExamForm({ ...examForm, questions: newQuestions });
                          }}
                          className="mr-2"
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              + Add Question
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Exam
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Exams</h2>
          <div className="bg-white rounded-lg shadow-md">
            {exams.map((exam) => (
              <div key={exam._id} className="p-4 border-b">
                <h3 className="text-xl font-semibold">{exam.title}</h3>
                <p className="text-gray-600">{exam.description}</p>
                <p className="text-sm text-gray-500">Duration: {exam.duration} minutes</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Students</h2>
          <div className="bg-white rounded-lg shadow-md">
            {students.map((student) => (
              <div key={student._id} className="p-4 border-b">
                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-gray-600">{student.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;