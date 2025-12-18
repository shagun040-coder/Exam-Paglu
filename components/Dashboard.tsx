
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

  // Fix: Added calculateProgress function to resolve the "Cannot find name 'calculateProgress'" error.
  // This calculates the percentage of completed tasks for a given subject.
  const calculateProgress = (subject: RoadmapResponse) => {
    const completed = progressData[subject.id] || [];
    if (subject.tasks.length === 0) return 0;
    return Math.round((completed.length / subject.tasks.length) * 100);
  };

  const handleDeleteSubject = (id: string, e: React.MouseEvent) => {
    // Stop the click from triggering the parent card's navigation
    e.stopPropagation();
    e.preventDefault();
    
    const confirmDelete = window.confirm("Are you sure you want to delete this subject? All your study progress and quiz results for this topic will be permanently removed.");
    
    if (confirmDelete) {
      // 1. Update subjects state and localStorage
      const updatedSubjects = subjects.filter(s => s.id !== id);
      setSubjects(updatedSubjects);
      localStorage.setItem('exampaglu_subjects', JSON.stringify(updatedSubjects));
      
      // 2. Clean up progress data
      const updatedProgress = { ...progressData };
      delete updatedProgress[id];
      setProgressData(updatedProgress);
      localStorage.setItem('exampaglu_progress', JSON.stringify(updatedProgress));

      // 3. Clean up quiz results
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-16 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <i className="fa-solid fa-book-open text-4xl text-slate-300"></i>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">No Targets Added Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed text-lg">
            Your Exam Paglu dashboard is ready! Add your first subject syllabus to start tracking your journey to success.
          </p>
          <Link 
            to="/planner" 
            className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center"
          >
            <i className="fa-solid fa-plus mr-3"></i>
            Add Your First Subject
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Subjects</h1>
          <p className="text-slate-500 mt-1">Manage your study goals and track overall progress</p>
        </div>
        <Link 
          to="/planner" 
          className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-md flex items-center"
        >
          <i className="fa-solid fa-plus mr-2"></i> Add Subject
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => {
          const progress = calculateProgress(subject);
          return (
            <div 
              key={subject.id}
              onClick={() => navigate(`/roadmap/${subject.id}`)}
              className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col relative"
            >
              {/* Delete Button Container - Ensures isolation and proper hit area */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  type="button"
                  onClick={(e) => handleDeleteSubject(subject.id, e)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-600 hover:bg-white transition-all rounded-xl shadow-lg border border-slate-100 flex items-center justify-center group/del"
                  title="Remove Subject"
                >
                  <i className="fa-solid fa-trash-can transition-transform group-hover/del:scale-110"></i>
                </button>
              </div>

              <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
                {subject.coverImage ? (
                  <img 
                    src={subject.coverImage} 
                    alt={subject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                    <i className="fa-solid fa-image text-6xl"></i>
                  </div>
                )}
                {/* Visual Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {subject.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">
                  {subject.summary}
                </p>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-orange-50 transition-colors">
                <span className="text-sm font-semibold text-slate-600 group-hover:text-orange-700">Open Roadmap</span>
                <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-orange-400 transition-transform group-hover:translate-x-1"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
