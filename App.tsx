
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import AnalysisResult from './components/AnalysisResult';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import ProfileSettings from './components/ProfileSettings';
import { analyzeFoodImage } from './services/geminiService';
import { AppState, FoodItem, DailyLog, UserProfile } from './types';

const DEFAULT_PROFILE: UserProfile = {
  height: 175,
  weight: 70,
  targetWeight: 68,
  gender: 'male',
  age: 25,
  activityLevel: 1.375,
  goal: 'maintain'
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [analysisResult, setAnalysisResult] = useState<FoodItem | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLogs = localStorage.getItem('fitfeast_logs');
    const savedProfile = localStorage.getItem('fitfeast_profile');
    
    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch (e) {}
    }
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitfeast_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('fitfeast_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handleCapture = async (base64: string) => {
    setCapturedImage(base64);
    setAppState('ANALYZING');
    setError(null);
    try {
      const result = await analyzeFoodImage(base64);
      if (result) {
        setAnalysisResult(result);
        setAppState('RESULT');
      } else {
        setError("未识别到有效食物，请对准食物重试。");
        setAppState('SCANNING');
      }
    } catch (err: any) {
      setError("分析食物失败，请确保网络通畅。");
      setAppState('SCANNING');
    }
  };

  const saveLog = (log: DailyLog) => {
    setLogs(prev => [log, ...prev]);
    setAppState('HOME');
    setAnalysisResult(null);
    setCapturedImage('');
  };

  const deleteLog = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'HOME':
        return <Dashboard logs={logs} profile={userProfile} onEditProfile={() => setAppState('PROFILE')} />;
      case 'PROFILE':
        return <ProfileSettings profile={userProfile} onSave={(p) => { setUserProfile(p); setAppState('HOME'); }} onBack={() => setAppState('HOME')} />;
      case 'SCANNING':
        return <Scanner onCapture={handleCapture} onCancel={() => setAppState('HOME')} />;
      case 'ANALYZING':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-black animate-spin" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI 正在深度分析</h2>
              <p className="text-xs text-gray-400 mt-2">计算每一克营养成分中...</p>
            </div>
          </div>
        );
      case 'RESULT':
        return analysisResult ? (
          <AnalysisResult food={analysisResult} imageUrl={capturedImage} onSave={saveLog} onCancel={() => setAppState('SCANNING')} />
        ) : null;
      case 'HISTORY':
        return <HistoryView logs={logs} onDelete={deleteLog} />;
      default:
        return <Dashboard logs={logs} profile={userProfile} onEditProfile={() => setAppState('PROFILE')} />;
    }
  };

  const currentTab = appState === 'HISTORY' ? 'history' : (appState === 'SCANNING' ? 'scan' : 'home');

  return (
    <Layout 
      activeTab={currentTab} 
      onTabChange={(tab) => {
        if (tab === 'scan') setAppState('SCANNING');
        else if (tab === 'history') setAppState('HISTORY');
        else setAppState('HOME');
      }}
      title={appState === 'RESULT' ? '确认报告' : undefined}
    >
      {error && (
        <div className="absolute top-16 left-6 right-6 z-[60] p-4 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
