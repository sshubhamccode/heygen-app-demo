import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { VideoProcessor } from './components/VideoProcessor';
import HeygenAvatar from './components/HeygenAvatar';
import { Auth } from './components/Auth';
import axios from 'axios';

function App() {
  const [activeTab, setActiveTab] = useState<'translator' | 'avatar'>('translator');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.get('http://localhost:5000/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setSession(response.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setSession(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={(session) => setSession(session)} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      session={session}
      onSignOut={() => {
        localStorage.removeItem('auth_token');
        setSession(null);
      }}
    >
      {activeTab === 'translator' ? <VideoProcessor /> : <HeygenAvatar />}
    </Layout>
  );
}

export default App;