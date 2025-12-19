
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Planner from './components/Planner';
import RoadmapDetail from './components/RoadmapDetail';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuth') === 'true';
  });
  const location = useLocation();

  const handleLogin = (status: boolean) => {
    setIsAuthenticated(status);
    localStorage.setItem('isAuth', status.toString());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuth');
  };

  const Navigation = () => {
    const isActive = (path: string) => location.pathname === path;

    return (
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
                <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                Exam <span className="text-orange-600">Paglu</span>
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  to="/planner" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/planner') ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'}`}
                >
                  <i className="fa-solid fa-plus-circle mr-2"></i>Create Plan
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'}`}
                >
                  <i className="fa-solid fa-layer-group mr-2"></i>My Subjects
                </Link>
                <Link 
                  to="/quiz" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/quiz') ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'}`}
                >
                  <i className="fa-solid fa-bolt mr-2"></i>Practice
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLoginSuccess={() => handleLogin(true)} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/planner" 
            element={isAuthenticated ? <Planner /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/roadmap/:subjectId" 
            element={isAuthenticated ? <RoadmapDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/quiz" 
            element={isAuthenticated ? <Quiz /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-2">
          <p>© 2024 Exam Paglu. Your AI Study Companion.</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
