
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateQuiz } from '../services/geminiService';
import { Question, QuizResult } from '../types';

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { subjectId?: string; taskId?: string; topic?: string; referenceText?: string } | null;

  const [topic, setTopic] = useState(state?.topic || '');
  const [referenceText, setReferenceText] = useState(state?.referenceText || '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.topic && !questions.length && !result) {
      handleStartQuiz();
    }
  }, [state]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setReferenceText(text);
      if (!topic) {
        setTopic(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }
    };
    reader.readAsText(file);
  };

  const handleStartQuiz = async () => {
    if (!topic) return;
    setLoading(true);
    setError('');
    setResult(null);
    setUserAnswers({});
    try {
      const data = await generateQuiz(topic, referenceText);
      setQuestions(data);
    } catch (err) {
      setError('Failed to generate quiz. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    const percentage = (score / questions.length) * 100;
    const finalResult: QuizResult = {
      score,
      total: questions.length,
      percentage,
      passed: percentage >= 60,
      attemptedAt: Date.now()
    };

    setResult(finalResult);

    // Save using rebranded keys
    if (state?.subjectId && state?.taskId) {
      const allQuizResults = JSON.parse(localStorage.getItem('exampaglu_quiz_results') || '{}');
      if (!allQuizResults[state.subjectId]) {
        allQuizResults[state.subjectId] = {};
      }
      allQuizResults[state.subjectId][state.taskId] = finalResult;
      localStorage.setItem('exampaglu_quiz_results', JSON.stringify(allQuizResults));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        {!questions.length && !result && (
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-brain text-3xl"></i>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Adaptive AI Quizzes</h1>
            <p className="text-slate-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Generate custom MCQs for any topic.
            </p>
            
            <div className="space-y-6 max-w-md mx-auto text-left">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Topic or Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Biology"
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-500 bg-slate-50 transition-all text-slate-700 font-medium"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Reference Material (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all
                    ${referenceText ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 hover:border-orange-300'}
                  `}
                >
                  <i className={`fas ${referenceText ? 'fa-file-alt' : 'fa-cloud-upload-alt'} text-3xl mb-3`}></i>
                  <span className="text-sm font-medium">
                    {referenceText ? 'Reference material loaded!' : 'Upload past papers (.txt)'}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={loading || !topic}
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold hover:bg-orange-700 active:scale-[0.98] transition-all shadow-xl shadow-orange-100 flex items-center justify-center text-lg mt-4 disabled:bg-slate-300"
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-play mr-3"></i>}
                Start AI Quiz
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}

        {questions.length > 0 && !result && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 line-clamp-1">{topic}</h2>
                <p className="text-slate-500 text-sm">Adaptive Session</p>
              </div>
              <button 
                onClick={() => setQuestions([])}
                className="text-slate-400 hover:text-red-500 text-sm font-medium"
              >
                Exit Quiz
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={q.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 leading-tight">
                  <span className="text-orange-600 mr-2">Q{qIndex + 1}.</span> {q.question}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <label
                      key={oIndex}
                      className={`
                        flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all select-none
                        ${userAnswers[q.id] === oIndex 
                          ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                          : 'bg-white border-slate-100 hover:border-orange-200 text-slate-600'}
                      `}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        className="hidden"
                        checked={userAnswers[q.id] === oIndex}
                        onChange={() => handleAnswerSelect(q.id, oIndex)}
                      />
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold transition-colors ${userAnswers[q.id] === oIndex ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <span className="font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold hover:bg-orange-700 active:scale-[0.98] transition-all disabled:bg-slate-200 shadow-xl shadow-orange-100 text-lg"
            >
              Submit Results
            </button>
          </div>
        )}

        {result && (
          <div className="text-center py-16 animate-scale-up">
            <div className={`inline-flex items-center justify-center w-32 h-32 text-white rounded-[2.5rem] text-4xl font-black mb-8 shadow-2xl ${result.passed ? 'bg-green-500 shadow-green-100' : 'bg-red-500 shadow-red-100'}`}>
              {result.percentage}%
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {result.passed ? 'Excellent Work!' : 'Keep Practicing!'}
            </h2>
            <p className="text-xl text-slate-500 mb-10">
              Score: <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-500'}`}>{result.score}/{result.total}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {state?.subjectId ? (
                <button
                  onClick={() => navigate(`/roadmap/${state.subjectId}`)}
                  className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg"
                >
                  Return to Roadmap
                </button>
              ) : (
                <button
                  onClick={() => {setQuestions([]); setResult(null); setTopic('');}}
                  className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg"
                >
                  New Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
