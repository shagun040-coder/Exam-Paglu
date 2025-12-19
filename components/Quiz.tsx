
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
    // Lock the question if it's already answered
    if (userAnswers[questionId] !== undefined) return;
    
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
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        {!questions.length && !result && (
          <div className="text-center py-6">
            <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <i className="fas fa-brain text-4xl"></i>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Adaptive Knowledge Quiz</h1>
            <p className="text-slate-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Generate custom MCQs to test your mastery of any topic.
            </p>
            
            <div className="space-y-8 max-w-md mx-auto text-left">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Quiz Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Biology"
                  className="w-full p-5 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-500 bg-slate-50 transition-all text-slate-700 font-bold text-lg"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Reference Material</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all
                    ${referenceText ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 hover:border-orange-300'}
                  `}
                >
                  <i className={`fas ${referenceText ? 'fa-file-circle-check' : 'fa-upload'} text-3xl mb-4`}></i>
                  <span className="font-bold">
                    {referenceText ? 'Reference Loaded' : 'Upload Past Papers'}
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
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black hover:bg-orange-700 active:scale-[0.98] transition-all shadow-xl shadow-orange-100 flex items-center justify-center text-xl mt-4 disabled:bg-slate-200"
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-play mr-3"></i>}
                Start Adaptive Quiz
              </button>
            </div>
          </div>
        )}

        {error && <div className="p-5 bg-red-50 text-red-600 rounded-2xl text-center mb-8 font-bold border border-red-100">{error}</div>}

        {questions.length > 0 && !result && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight line-clamp-1">{topic}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Session Active</p>
                </div>
              </div>
              <button 
                onClick={() => setQuestions([])}
                className="text-slate-400 hover:text-red-500 text-sm font-black uppercase tracking-widest transition-colors"
              >
                Quit Quiz
              </button>
            </div>

            {questions.map((q, qIndex) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              
              return (
                <div key={q.id} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                  <h3 className="text-2xl font-black text-slate-800 mb-8 leading-tight">
                    <span className="text-orange-600 mr-3">#{qIndex + 1}</span> {q.question}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {q.options.map((opt, oIndex) => {
                      const isSelected = userAnswers[q.id] === oIndex;
                      const isCorrect = oIndex === q.correctAnswer;
                      
                      let containerClass = "flex items-center p-6 rounded-2xl border-2 transition-all select-none ";
                      let iconClass = "w-10 h-10 rounded-xl flex items-center justify-center mr-5 text-lg font-black transition-all ";

                      if (!isAnswered) {
                        containerClass += "cursor-pointer bg-white border-slate-100 hover:border-orange-200 hover:shadow-md text-slate-700";
                        iconClass += "bg-slate-100 text-slate-400";
                      } else {
                        containerClass += "cursor-default ";
                        if (isSelected && isCorrect) {
                          containerClass += "bg-green-600 border-green-600 text-white shadow-xl shadow-green-100 scale-[1.03]";
                          iconClass += "bg-green-500 text-white";
                        } else if (isSelected && !isCorrect) {
                          containerClass += "bg-red-600 border-red-600 text-white shadow-xl shadow-red-100 scale-[1.03]";
                          iconClass += "bg-red-500 text-white";
                        } else if (isCorrect) {
                          containerClass += "bg-green-50 border-green-500 text-green-800 border-dashed";
                          iconClass += "bg-green-500 text-white";
                        } else {
                          containerClass += "bg-white border-slate-100 text-slate-300 opacity-60";
                          iconClass += "bg-slate-50 text-slate-200";
                        }
                      }

                      return (
                        <label key={oIndex} className={containerClass}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="hidden"
                            disabled={isAnswered}
                            checked={isSelected}
                            onChange={() => handleAnswerSelect(q.id, oIndex)}
                          />
                          <span className={iconClass}>
                            {isSelected && isCorrect && <i className="fas fa-check-circle"></i>}
                            {isSelected && !isCorrect && <i className="fas fa-times-circle"></i>}
                            {!isSelected && isCorrect && isAnswered && <i className="fas fa-check"></i>}
                            {(!isAnswered || (!isSelected && !isCorrect)) && String.fromCharCode(65 + oIndex)}
                          </span>
                          <span className="font-bold text-lg">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black hover:bg-orange-700 active:scale-[0.98] transition-all disabled:bg-slate-200 shadow-2xl shadow-orange-100 text-xl"
            >
              Finish Assessment
            </button>
          </div>
        )}

        {result && (
          <div className="text-center py-20 animate-fade-in">
            <div className={`inline-flex items-center justify-center w-40 h-40 text-white rounded-[3rem] text-5xl font-black mb-10 shadow-2xl ${result.passed ? 'bg-green-500 shadow-green-100' : 'bg-red-500 shadow-red-100'}`}>
              {result.percentage}%
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
              {result.passed ? 'Excellent Work!' : 'Keep Practicing!'}
            </h2>
            <p className="text-2xl text-slate-500 mb-12">
              Score: <span className={`font-black ${result.passed ? 'text-green-600' : 'text-red-500'}`}>{result.score}/{result.total}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {state?.subjectId ? (
                <button
                  onClick={() => navigate(`/roadmap/${state.subjectId}`)}
                  className="bg-orange-600 text-white px-12 py-5 rounded-2xl font-black hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 text-lg"
                >
                  Return to Roadmap
                </button>
              ) : (
                <button
                  onClick={() => {setQuestions([]); setResult(null); setTopic('');}}
                  className="bg-orange-600 text-white px-12 py-5 rounded-2xl font-black hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 text-lg"
                >
                  New Quiz
                </button>
              )}
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-slate-100 text-slate-600 px-12 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200 text-lg"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
