
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStudyRoadmap, generateSubjectImage } from '../services/geminiService';

const Planner: React.FC = () => {
  const [syllabus, setSyllabus] = useState('');
  const [examDate, setExamDate] = useState('');
  const [samplePaperText, setSamplePaperText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSamplePaperText(text);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!syllabus || !examDate) {
      setError('Please provide both a syllabus and an exam date.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Step 1: Generate the roadmap
      const roadmap = await generateStudyRoadmap(syllabus, examDate, samplePaperText);
      
      // Step 2: Generate a custom illustration for this subject
      const coverImage = await generateSubjectImage(roadmap.title);
      
      const newSubject = {
        ...roadmap,
        id: `sub_${Date.now()}`,
        createdAt: Date.now(),
        coverImage: coverImage
      };

      const existing = JSON.parse(localStorage.getItem('exampaglu_subjects') || '[]');
      const updated = [...existing, newSubject];
      
      localStorage.setItem('exampaglu_subjects', JSON.stringify(updated));
      
      const progress = JSON.parse(localStorage.getItem('exampaglu_progress') || '{}');
      progress[newSubject.id] = [];
      localStorage.setItem('exampaglu_progress', JSON.stringify(progress));

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to generate roadmap. Please check your API connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-magic text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Subject</h1>
          <p className="text-slate-500 mt-2">Create an AI-powered study roadmap for your course</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Subject Syllabus</label>
            <div className="relative">
              <textarea
                className="w-full p-6 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-orange-50 focus:border-orange-500 min-h-[180px] outline-none transition-all text-slate-700 leading-relaxed shadow-inner bg-slate-50"
                placeholder="Paste your course syllabus or topic list here..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              Sample Paper / Past Questions (Optional)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                w-full p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all
                ${samplePaperText ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 hover:border-orange-300'}
              `}
            >
              <i className={`fa-solid ${samplePaperText ? 'fa-file-circle-check' : 'fa-file-upload'} text-2xl mb-2`}></i>
              <span className="text-sm font-medium">
                {samplePaperText ? 'Sample paper uploaded successfully!' : 'Click to upload past paper (.txt)'}
              </span>
              {samplePaperText && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSamplePaperText(''); }} 
                  className="mt-2 text-xs font-bold text-orange-400 hover:text-red-500 transition-colors"
                >
                  Remove file
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Exam Date</label>
            <input
              type="date"
              className="w-full p-5 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-700"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center">
              <i className="fa-solid fa-exclamation-triangle mr-3"></i>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold hover:bg-orange-700 active:scale-[0.98] transition-all shadow-xl shadow-orange-100 flex items-center justify-center text-lg"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
                Drafting Roadmap...
              </>
            ) : (
              <>
                <i className="fa-solid fa-rocket mr-3"></i>
                Generate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planner;
