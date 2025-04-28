import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProcessingPage from './pages/ProcessingPage';
import SubmissionPage from './pages/SubmissionPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/processing/:submissionId" element={<ProcessingPage />} />
          <Route path="/submission/:submissionId" element={<SubmissionPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;