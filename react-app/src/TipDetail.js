import React from 'react';

function TipDetail({ tip, onClose }) {
  if (!tip) return null;

  return (
    <div className="tip-detail-overlay">
      <div className="tip-detail-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Tip {tip.id}</h2>
        <h3>{tip.title}</h3>
        <div className="tip-content">
          {tip.content}
        </div>
        {tip.image && (
          <div className="tip-image">
            <img src={tip.image} alt={tip.title} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TipDetail;
