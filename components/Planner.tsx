
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
      const roadmap = await generateStudyRoadmap(syllabus, examDate, samplePaperText);
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
      setError('Generation failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
            <i className="fa-solid fa-fire text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Study Roadmap</h1>
          <p className="text-slate-500 mt-3 text-lg">Ignite your AI-powered plan for this course</p>
        </div>

        <div className="space-y-10">
          <div>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Course Syllabus</label>
            <div className="relative">
              <textarea
                className="w-full p-8 border-2 border-slate-100 rounded-[2.5rem] focus:ring-8 focus:ring-orange-50 focus:border-orange-500 min-h-[200px] outline-none transition-all text-slate-700 leading-relaxed shadow-inner bg-slate-50 text-lg font-medium"
                placeholder="Paste your course syllabus or list of topics here..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
              Past Exam Pattern (Optional)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                w-full p-8 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all
                ${samplePaperText ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 hover:border-orange-400'}
              `}
            >
              <i className={`fa-solid ${samplePaperText ? 'fa-circle-check' : 'fa-upload-box'} text-4xl mb-4`}></i>
              <span className="text-lg font-bold">
                {samplePaperText ? 'Pattern Loaded' : 'Upload Past Paper (.txt)'}
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

          <div>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Exam Date</label>
            <input
              type="date"
              className="w-full p-6 border-2 border-slate-100 rounded-2xl focus:ring-8 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-700 font-bold text-xl"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <div className="p-5 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center border border-red-100">
              <i className="fa-solid fa-triangle-exclamation mr-4 text-xl"></i>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black hover:bg-orange-700 active:scale-[0.98] transition-all shadow-2xl shadow-orange-100 flex items-center justify-center text-2xl"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-sync fa-spin mr-4"></i>
                Generating Roadmap...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles mr-4"></i>
                Create Roadmap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planner;
