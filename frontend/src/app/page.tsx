'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Connect to our FastAPI backend
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            EvoMal AI
          </div>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">Overview</a>
          <a href="#" className="nav-item">APK Analysis</a>
          <a href="#" className="nav-item active">Evolution Forecast</a>
          <a href="#" className="nav-item">Reports</a>
          <a href="#" className="nav-item">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          Evolution Forecast
        </header>
        
        <div className="content-area">
          {/* Upload Area */}
          <div className="upload-card" onClick={() => document.getElementById('file-upload')?.click()}>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3 className="upload-title">
              {file ? file.name : "Drag and drop APK file or click to browse"}
            </h3>
            <p className="upload-subtitle">Upload a malware sample to generate its predictive evolution tree</p>
            <input 
              type="file" 
              id="file-upload" 
              className="file-input" 
              accept=".apk,.zip" 
              onChange={handleFileChange}
            />
            {file && (
              <button 
                className="button" 
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Generate Forecast"}
              </button>
            )}
            
            {error && <p style={{color: 'var(--danger)', marginTop: '16px'}}>{error}</p>}
          </div>

          {/* Results Area */}
          {loading && (
             <div style={{textAlign: 'center', padding: '40px'}}>
                <div className="loader"></div>
                <p style={{marginTop: '16px', color: 'var(--text-muted)'}}>Predicting future mutations via AI...</p>
             </div>
          )}

          {result && !loading && (
            <div className="dashboard-grid">
              
              {/* DNA Profile */}
              <div className="card">
                <h3 className="card-title">Behavioral DNA Profile</h3>
                {Object.entries(result.behavioral_dna).map(([trait, probability]) => (
                  <div className="dna-row" key={trait}>
                    <span className="dna-label">{trait}</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div className="dna-bar-container">
                        <div className="dna-bar" style={{width: `${probability}%`}}></div>
                      </div>
                      <span className="dna-value">{probability as number}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Evolution Tree */}
              <div className="card">
                <h3 className="card-title">Mutation Forecast Engine</h3>
                <div className="tree-node tree-root">
                  {result.evolution_tree.root}
                </div>
                {result.evolution_tree.branches?.map((branch: any, idx: number) => (
                  <div className="tree-branch" key={idx}>
                    <div className="tree-node">
                      ↳ {branch.target}
                    </div>
                    {branch.sub_branches?.map((sub: string, subIdx: number) => (
                      <div className="tree-branch" key={`sub-${subIdx}`}>
                        <div className="tree-node" style={{backgroundColor: 'white'}}>
                          ↳ {sub}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Threat Score */}
              <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
                <h3 className="card-title">Threat Assessment Score</h3>
                <div className="threat-score-container">
                  <div className={`score-circle ${result.threat_score > 75 ? 'score-high' : 'score-medium'}`}>
                    {result.threat_score}
                  </div>
                  <span className={`score-badge ${result.threat_score > 75 ? 'badge-high' : ''}`}>
                    {result.threat_score > 75 ? 'High Risk of Mutation' : 'Moderate Risk'}
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h3 className="card-title">Recommended Defenses</h3>
                <ul className="rec-list">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li className="rec-item" key={idx}>
                      <div className="rec-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
