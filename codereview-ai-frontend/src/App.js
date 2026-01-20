import React, { useState, useEffect } from 'react';
import { Search, Code, FileText, TrendingUp, CheckCircle, AlertCircle, Clock, Trash2, User } from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:8000/api';

const CodeReviewApp = () => {
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem('user_name'));
  const [activeTab, setActiveTab] = useState('submit');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (userName) {
      loadReviews();
      loadStats();
    }
  }, [userName]);

  const handleSetName = () => {
    if (userName.trim()) {
      localStorage.setItem('user_name', userName);
      setShowNamePrompt(false);
      loadReviews();
      loadStats();
    } else {
      alert('Please enter your name');
    }
  };

  const handleChangeName = () => {
    setShowNamePrompt(true);
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews?user_name=${encodeURIComponent(userName)}`);
      const data = await response.json();
      setReviews(data.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats?user_name=${encodeURIComponent(userName)}`);
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim() || !filename.trim()) {
      alert('Please provide both filename and code');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          filename,
          language,
          code
        }),
      });

      const data = await response.json();
      const reviewId = data.data.id;
      
      // Start polling for results
      const pollInterval = setInterval(async () => {
        try {
          const result = await fetch(`${API_URL}/reviews/${reviewId}`);
          const reviewData = await result.json();
          const review = reviewData.data;
          
          if (review.status === 'completed') {
            clearInterval(pollInterval);
            setReviewResult({
              id: review.id,
              filename: review.filename,
              language: review.language,
              original_code: review.original_code,
              issues: review.issues.map(i => ({
                line: i.line_number,
                severity: i.severity,
                type: i.type,
                message: i.message,
                suggestion: i.suggestion,
              })),
              summary: {
                total_issues: review.total_issues,
                high: review.high_severity,
                medium: review.medium_severity,
                low: review.low_severity,
                suggestions: review.suggestions_count,
              },
              ai_analysis: review.ai_analysis,
            });
            setIsAnalyzing(false);
            setActiveTab('result');
            loadReviews();
            loadStats();
          } else if (review.status === 'failed') {
            clearInterval(pollInterval);
            alert('Analysis failed. Please try again.');
            setIsAnalyzing(false);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000);
    } catch (error) {
      alert(error.message || 'Failed to submit code');
      setIsAnalyzing(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setReviews(reviews.filter(r => r.id !== id));
      loadStats();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-purple-500/20 w-full max-w-md">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">CodeReview AI</h1>
          </div>

          <p className="text-gray-300 text-center mb-6">
            Welcome! Please enter your name to get started with AI-powered code reviews.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetName()}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={handleSetName}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Start Reviewing Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">CodeReview AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-5 h-5" />
                <span>{userName}</span>
              </div>
              <button
                onClick={handleChangeName}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-all"
              >
                Change Name
              </button>
            </div>
          </div>
          <nav className="flex space-x-1 mt-4">
            <button
              onClick={() => { setActiveTab('submit'); loadReviews(); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'submit' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              Submit Code
            </button>
            <button
              onClick={() => { setActiveTab('history'); loadReviews(); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'history' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              History
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); loadStats(); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'submit' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4">Submit Code for Review</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Filename</label>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="e.g., UserController.php"
                      className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="php">PHP</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    rows={15}
                    className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                <button
                  onClick={handleSubmitCode}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing Code...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Analyze Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'result' && reviewResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">High Severity</p>
                    <p className="text-3xl font-bold text-white">{reviewResult.summary.high}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Medium Severity</p>
                    <p className="text-3xl font-bold text-white">{reviewResult.summary.medium}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Low Severity</p>
                    <p className="text-3xl font-bold text-white">{reviewResult.summary.low}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Suggestions</p>
                    <p className="text-3xl font-bold text-white">{reviewResult.summary.suggestions}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">AI Analysis Summary</h3>
              <p className="text-gray-300 leading-relaxed">{reviewResult.ai_analysis}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Issues</h3>
              <div className="space-y-4">
                {reviewResult.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      issue.severity === 'high'
                        ? 'bg-red-500/10 border-red-500'
                        : issue.severity === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500'
                        : 'bg-blue-500/10 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-400">Line {issue.line}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          issue.severity === 'high'
                            ? 'bg-red-500 text-white'
                            : issue.severity === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-purple-500/30 rounded text-xs font-semibold text-purple-200">
                          {issue.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-white font-medium mb-2">{issue.message}</p>
                    <div className="bg-black/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <span className="text-green-400 font-semibold">💡 Suggestion: </span>
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('submit');
                setCode('');
                setFilename('');
                setReviewResult(null);
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-semibold transition-all border border-purple-500/30"
            >
              Review Another File
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-6">Review History</h2>
            
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet. Submit your first code!</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-purple-500/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <FileText className="w-8 h-8 text-purple-400" />
                        <div>
                          <h3 className="text-white font-semibold">{review.filename}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {review.created_at}
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-500/30 rounded text-purple-200">
                              {review.language}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              review.status === 'completed' ? 'bg-green-500/30 text-green-200' :
                              review.status === 'processing' ? 'bg-yellow-500/30 text-yellow-200' :
                              'bg-gray-500/30 text-gray-200'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {review.status === 'completed' && (
                          <div className="text-right">
                            <p className="text-sm text-red-400">{review.total_issues} issues</p>
                            <p className="text-sm text-green-400">{review.suggestions_count} suggestions</p>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Total Reviews</p>
                    <p className="text-4xl font-bold text-white mt-2">{stats.total_reviews}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-pink-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Issues Found</p>
                    <p className="text-4xl font-bold text-white mt-2">{stats.total_issues}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-pink-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Avg Issues/Review</p>
                    <p className="text-4xl font-bold text-white mt-2">{stats.avg_issues_per_review}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-blue-400" />
                </div>
              </div>
            </div>

            {stats.common_issues && stats.common_issues.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Most Common Issues</h3>
                <div className="space-y-3">
                  {stats.common_issues.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{item.type}</span>
                          <span className="text-sm font-semibold text-white">{item.count}</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((item.count / (stats.common_issues[0]?.count || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CodeReviewApp;