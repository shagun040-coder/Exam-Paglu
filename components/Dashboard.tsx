
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoadmapResponse } from '../types';

const Dashboard: React.FC = () => {
  const [subjects, setSubjects] = useState<RoadmapResponse[]>([]);
  const [progressData, setProgressData] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const savedSubjects = localStorage.getItem('exampaglu_subjects');
    const savedProgress = localStorage.getItem('exampaglu_progress');
    
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
    if (savedProgress) {
      setProgressData(JSON.parse(savedProgress));
    }
  }, []);

  const calculateProgress = (subject: RoadmapResponse) => {
    const completed = progressData[subject.id] || [];
    if (subject.tasks.length === 0) return 0;
    return Math.round((completed.length / subject.tasks.length) * 100);
  };

  const handleDeleteSubject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const confirmDelete = window.confirm("Are you sure you want to remove this subject? All progress will be lost.");
    
    if (confirmDelete) {
      const updatedSubjects = subjects.filter(s => s.id !== id);
      setSubjects(updatedSubjects);
      localStorage.setItem('exampaglu_subjects', JSON.stringify(updatedSubjects));
      
      const updatedProgress = { ...progressData };
      delete updatedProgress[id];
      setProgressData(updatedProgress);
      localStorage.setItem('exampaglu_progress', JSON.stringify(updatedProgress));

      const savedQuizResults = localStorage.getItem('exampaglu_quiz_results');
      if (savedQuizResults) {
        const quizResults = JSON.parse(savedQuizResults);
        if (quizResults[id]) {
          delete quizResults[id];
          localStorage.setItem('exampaglu_quiz_results', JSON.stringify(quizResults));
        }
      }
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="bg-white p-16 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
             <i className="fa-solid fa-book-open text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">No Subjects Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed text-lg">
            Start your journey by creating your first subject roadmap. Exam Paglu will create a tailored plan for your success.
          </p>
          <Link 
            to="/planner" 
            className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center text-lg"
          >
            <i className="fa-solid fa-plus-circle mr-3"></i>
            Add Your First Subject
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Subjects</h1>
          <p className="text-slate-500 mt-1">Manage your goals and track progress</p>
        </div>
        <Link 
          to="/planner" 
          className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center"
        >
          <i className="fa-solid fa-plus-circle mr-2"></i> New Subject
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => {
          const progress = calculateProgress(subject);
          return (
            <div 
              key={subject.id}
              onClick={() => navigate(`/roadmap/${subject.id}`)}
              className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-4 right-4 z-20">
                <button 
                  type="button"
                  onClick={(e) => handleDeleteSubject(subject.id, e)}
                  className="w-10 h-10 bg-white/95 backdrop-blur-md text-slate-400 hover:text-red-600 hover:bg-white transition-all rounded-xl shadow-lg border border-slate-100 flex items-center justify-center group/del"
                  title="Remove Subject"
                >
                  <i className="fa-solid fa-trash-can transition-transform group-hover/del:scale-110"></i>
                </button>
              </div>

              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                {subject.coverImage ? (
                  <img 
                    src={subject.coverImage} 
                    alt={subject.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                    <i className="fa-solid fa-book-bookmark text-6xl"></i>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </div>
              
              <div className="p-8 flex-grow">
                <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {subject.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
                  {subject.summary}
                </p>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-50">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-between items-center group-hover:bg-orange-50 transition-colors">
                <span className="text-sm font-bold text-slate-600 group-hover:text-orange-700">Open Roadmap</span>
                <i className="fa-solid fa-arrow-right-long text-slate-300 group-hover:text-orange-400 transition-transform group-hover:translate-x-2"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
