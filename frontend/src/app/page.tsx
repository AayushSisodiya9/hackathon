'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Evolution Forecast');

  const tabs = ['Overview', 'APK Analysis', 'Evolution Forecast', 'Reports', 'Settings'];

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

  const renderOverview = () => (
    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div className="card" style={{ gridColumn: 'span 3', display: 'flex', gap: '24px', backgroundColor: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total APKs Scanned</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0', color: 'var(--foreground)' }}>1,284</h2>
          <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>+12% from last week</span>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>High Risk Threats Prevented</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0', color: 'var(--danger)' }}>342</h2>
          <span style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>+5% from last week</span>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Active Forecasting Models</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0', color: 'var(--primary)' }}>4</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gemini 1.5 Flash</span>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h3 className="card-title">Weekly Threat Activity</h3>
        <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          {/* Mock Bar Chart */}
          {[40, 60, 45, 80, 50, 90, 65].map((h, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: 'var(--primary)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      <div className="card" style={{ gridColumn: 'span 1' }}>
        <h3 className="card-title">Top Detected Families</h3>
        <ul className="rec-list">
          {['Cerberus Banking Trojan', 'FluBot SMS Stealer', 'Joker Fleeceware', 'AlienBot'].map((fam, i) => (
            <li className="rec-item" key={i} style={{ padding: '8px 12px', marginBottom: '8px', borderLeft: '3px solid var(--danger)' }}>
              <span style={{ fontWeight: 500 }}>{fam}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderApkAnalysis = () => (
    <div className="dashboard-grid">
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h3 className="card-title">Static Analysis Engine (Androguard Integration)</h3>
        
        {result && result.metadata ? (
          <div>
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: '#f8fafc', marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Analysis for: {result.filename}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Obfuscation / Packer Status</p>
                  <p style={{ fontWeight: 600, color: result.metadata.obfuscated ? 'var(--danger)' : 'var(--success)' }}>
                    {result.metadata.obfuscated ? 'Detected: ' + result.metadata.obfuscation_reason : 'Clear (No obvious packers)'}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Extracted Permissions</p>
                  <p style={{ fontWeight: 600 }}>{result.metadata.permission_count} permissions</p>
                </div>
              </div>
            </div>
            
            <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>Verified MITRE ATT&CK Tactics</h4>
            {result.metadata.mitre_tactics && result.metadata.mitre_tactics.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.metadata.mitre_tactics.map((tactic: string, idx: number) => (
                  <span key={idx} style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '6px 14px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
                    {tactic}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No critical MITRE tactics directly mapped from manifest.</p>
            )}
          </div>
        ) : (
          <div style={{ padding: '24px', border: '1px dashed var(--border)', borderRadius: '8px', backgroundColor: '#f8fafc', marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Upload an APK in the Forecast tab first to view real-time decompiled metadata and MITRE mappings.</p>
            <button className="button" onClick={() => setActiveTab('Evolution Forecast')}>Go to Forecast Engine</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <h3 className="card-title" style={{ padding: '24px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>Recent Threat Intelligence Reports</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>File Hash (MD5)</th>
            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Predicted Mutation</th>
            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Risk Score</th>
            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {[
            { hash: 'e99a18c428cb38d5f260853678922e03', mut: 'Ransomware Payload', score: 92, date: '2026-06-25' },
            { hash: '1a79a4d60de6718e8e5b326e338ae533', mut: 'OTP Interception', score: 85, date: '2026-06-24' },
            { hash: '8f14e45fceea167a5a36dedd4bea2543', mut: 'Overlay Injection', score: 78, date: '2026-06-24' },
            { hash: '2b8288ce426462719602fa48e9a11883', mut: 'Data Exfiltration', score: 45, date: '2026-06-22' },
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontSize: '0.875rem' }}>{row.hash}</td>
              <td style={{ padding: '16px 24px', fontWeight: 500 }}>{row.mut}</td>
              <td style={{ padding: '16px 24px' }}>
                <span className={`score-badge ${row.score > 75 ? 'badge-high' : ''}`} style={{ backgroundColor: row.score > 75 ? 'var(--danger-bg)' : '#fef3c7', color: row.score > 75 ? 'var(--danger)' : '#d97706' }}>
                  {row.score}/100
                </span>
              </td>
              <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSettings = () => (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h3 className="card-title">Platform Settings</h3>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Google Gemini API Key</label>
        <input type="password" value="*************************" readOnly style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f8fafc', color: 'var(--text-muted)' }} />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Used for the Evolution Forecast AI engine.</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Analysis Threshold</label>
        <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
          <option>High Sensitivity (Flag all suspicious behavior)</option>
          <option>Balanced (Default)</option>
          <option>Low Sensitivity (Only flag critical threats)</option>
        </select>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input type="checkbox" id="notif" defaultChecked style={{ width: '16px', height: '16px' }} />
        <label htmlFor="notif" style={{ fontWeight: 500 }}>Enable Real-time Threat Alerts via Email</label>
      </div>

      <button className="button" style={{ width: '100%' }}>Save Configuration</button>
    </div>
  );

  const renderForecast = () => (
    <>
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
          accept=".apk,.zip,.txt" 
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

      {loading && (
         <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="loader"></div>
            <p style={{marginTop: '16px', color: 'var(--text-muted)'}}>Predicting future mutations via Gemini AI...</p>
         </div>
      )}

      {result && !loading && (
        <div className="dashboard-grid">
          
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
    </>
  );

  return (
    <div className="app-container">
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
          {tabs.map((tab) => (
            <button 
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: activeTab === tab ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          {activeTab}
        </header>
        
        <div className="content-area">
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'APK Analysis' && renderApkAnalysis()}
          {activeTab === 'Reports' && renderReports()}
          {activeTab === 'Settings' && renderSettings()}
          {activeTab === 'Evolution Forecast' && renderForecast()}
        </div>
      </main>
    </div>
  );
}
