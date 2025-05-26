import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { VideoProcessor } from './components/VideoProcessor';
import HeygenAvatar from './components/HeygenAvatar';
import { Auth } from './components/Auth';
import { supabase } from './utils/supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState<'translator' | 'avatar'>('translator');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      session={session}
      onSignOut={() => supabase.auth.signOut()}
    >
      {activeTab === 'translator' ? <VideoProcessor /> : <HeygenAvatar />}
    </Layout>
  );
}

export default App;