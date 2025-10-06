import React from 'react';

function TipList({ tips, onTipSelect }) {
  console.log('TipList rendering with tips:', tips.length);
  
  return (
    <div className="tip-list">
      <h1>Simplify Drupal - Daily Tips</h1>
      <div className="tips-grid">
        {tips.map((tip, index) => (
          <div 
            key={index} 
            className="tip-card"
            onClick={() => {
              console.log('Tip clicked:', index, tip);
              onTipSelect(index);
            }}
          >
            <h3>Tip {index + 1}</h3>
            <p>{tip.title}</p>
            <span className="read-more">Click to read more...</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TipList;
