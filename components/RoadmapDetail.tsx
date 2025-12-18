
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RoadmapResponse, QuizResult } from '../types';

const RoadmapDetail: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<RoadmapResponse | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});

  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem('exampaglu_subjects') || '[]');
    const currentSubject = savedSubjects.find((s: RoadmapResponse) => s.id === subjectId);
    
    if (!currentSubject) {
      navigate('/dashboard');
      return;
    }

    setSubject(currentSubject);

    const allProgress = JSON.parse(localStorage.getItem('exampaglu_progress') || '{}');
    setCompletedTasks(new Set(allProgress[subjectId!] || []));

    const allQuizResults = JSON.parse(localStorage.getItem('exampaglu_quiz_results') || '{}');
    setQuizResults(allQuizResults[subjectId!] || {});
  }, [subjectId, navigate]);

  const toggleTask = (taskId: string) => {
    const newProgress = new Set(completedTasks);
    if (newProgress.has(taskId)) {
      newProgress.delete(taskId);
    } else {
      newProgress.add(taskId);
    }
    setCompletedTasks(newProgress);

    const allProgress = JSON.parse(localStorage.getItem('exampaglu_progress') || '{}');
    allProgress[subjectId!] = Array.from(newProgress);
    localStorage.setItem('exampaglu_progress', JSON.stringify(allProgress));
  };

  const handleStartQuiz = (task: any) => {
    navigate('/quiz', { 
      state: { 
        subjectId, 
        taskId: task.id, 
        topic: task.label,
        referenceText: `Context: This is for Day ${task.day} of study for ${subject?.title}. Focus: ${task.description}`
      } 
    });
  };

  if (!subject) return null;

  const progressPercent = subject.tasks.length > 0 
    ? Math.round((completedTasks.size / subject.tasks.length) * 100) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/dashboard" className="text-orange-600 font-bold text-sm hover:underline flex items-center mb-4">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back to My Subjects
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-grow">
            {subject.coverImage && (
              <img 
                src={subject.coverImage} 
                alt="" 
                className="w-24 h-24 rounded-3xl object-cover shadow-md border-4 border-slate-50"
              />
            )}
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{subject.title}</h1>
              <p className="text-slate-500 max-w-2xl">{subject.summary}</p>
            </div>
          </div>
          <div className="bg-orange-50 px-8 py-6 rounded-3xl text-center min-w-[160px]">
            <div className="text-4xl font-black text-orange-600">{progressPercent}%</div>
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mt-1">Completion</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute left-[31px] md:left-[51px] top-20 bottom-20 w-1 bg-orange-50 rounded-full"></div>
        
        <div className="space-y-12 relative">
          {subject.tasks.map((task) => {
            const isDone = completedTasks.has(task.id);
            const qResult = quizResults[task.id];
            
            return (
              <div key={task.id} className="flex gap-6 md:gap-10 group items-start">
                <div className="relative z-10">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`
                      w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center border-4 transition-all duration-300
                      ${isDone 
                        ? 'bg-green-500 border-green-100 text-white shadow-lg shadow-green-100 scale-110' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500'}
                    `}
                  >
                    {isDone ? (
                      <i className="fa-solid fa-check text-2xl"></i>
                    ) : (
                      <span className="font-black text-xl">{task.day}</span>
                    )}
                  </button>
                </div>
                
                <div className="flex-grow">
                  <div className={`
                    p-6 md:p-8 rounded-[2rem] border-2 transition-all group-hover:shadow-md
                    ${isDone 
                      ? 'bg-green-50/20 border-green-100' 
                      : 'bg-slate-50 border-slate-50 hover:bg-white hover:border-orange-100'}
                  `}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className={`text-xl font-bold ${isDone ? 'text-green-800' : 'text-slate-800'}`}>
                          {task.label}
                        </h3>
                        <p className={`mt-2 text-sm leading-relaxed ${isDone ? 'text-green-700/80' : 'text-slate-500'}`}>
                          {task.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center min-w-[120px]">
                        <button
                          onClick={() => handleStartQuiz(task)}
                          className={`
                            px-4 py-3 rounded-xl font-bold text-sm w-full transition-all flex items-center justify-center gap-2
                            ${qResult 
                              ? 'bg-white border-2 border-slate-100 text-slate-600 hover:border-orange-200' 
                              : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-100'}
                          `}
                        >
                          <i className="fa-solid fa-vial"></i>
                          {qResult ? 'Retake Quiz' : 'Take Quiz'}
                        </button>
                        
                        {qResult && (
                          <div className="mt-3 text-center animate-fade-in">
                            <div className="flex items-center justify-center gap-2">
                              {qResult.passed ? (
                                <span className="bg-green-100 text-green-700 p-1.5 rounded-full text-[10px]">
                                  <i className="fa-solid fa-check"></i>
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-700 p-1.5 rounded-full text-[10px]">
                                  <i className="fa-solid fa-times"></i>
                                </span>
                              )}
                              <span className={`text-sm font-bold ${qResult.passed ? 'text-green-600' : 'text-red-500'}`}>
                                Score: {qResult.score}/{qResult.total}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
