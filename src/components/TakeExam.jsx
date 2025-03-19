import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TakeExam() {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setExam(response.data);
        setTimeLeft(response.data.duration * 60);
        setAnswers(response.data.questions.map(() => ({ selectedOption: null })));
      } catch (error) {
        console.error('Error fetching exam:', error);
      }
    };

    fetchExam();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          clearInterval(timer);
          handleSubmit();
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    try {
      const formattedAnswers = answers.map((answer, index) => ({
        question: exam.questions[index]._id,
        selectedOption: answer.selectedOption
      }));

      await axios.post(
        `http://localhost:5000/api/exams/${id}/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  if (!exam) {
    return <div>Loading...</div>;
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <div className="text-xl font-semibold text-blue-600">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <p className="text-gray-600 mb-6">{exam.description}</p>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {exam.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">
                {qIndex + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} className="flex items-center space-x-3 p-3 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={option._id}
                      checked={answers[qIndex]?.selectedOption === option._id}
                      onChange={() => {
                        const newAnswers = [...answers];
                        newAnswers[qIndex] = { selectedOption: option._id };
                        setAnswers(newAnswers);
                      }}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="text-gray-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Submit Exam
          </button>
        </form>
      </div>
    </div>
  );
}

export default TakeExam;