"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

const AIInsights = ({ insight, tags }) => {
  return (
    <div className="ai-insight-box animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '8px', background: 'var(--accent-gradient)', borderRadius: '10px' }}>
          <Sparkles size={20} color="white" />
        </div>
        <h3 className="gradient-text" style={{ fontSize: '1.25rem' }}>AI Talent Insights</h3>
      </div>
      <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
        {insight || "Analyzing interaction patterns to identify hidden capabilities..."}
      </p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {(tags || ["High Engagement", "Fast Learner", "Role Fit"]).map((tag, idx) => (
          <span key={idx} style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            background: idx % 2 === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(236, 72, 153, 0.2)', 
            fontSize: '0.8rem',
            color: idx % 2 === 0 ? '#818cf8' : '#f472b6',
            border: idx % 2 === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(236, 72, 153, 0.3)'
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
