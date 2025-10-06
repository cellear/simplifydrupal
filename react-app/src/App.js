import React, { useState, useEffect } from 'react';
import TipList from './TipList';
import TipDetail from './TipDetail';
import './App.css';

function App() {
  const [tips, setTips] = useState([]);
  const [selectedTip, setSelectedTip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real tips from Drupal JSON:API
  useEffect(() => {
    const fetchTips = async () => {
      try {
        // Get all article nodes from Drupal JSON:API
        const response = await fetch('/jsonapi/node/article', {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tips');
        }
        
        const data = await response.json();
        
        // Transform JSON:API data to our format
        const transformedTips = data.data.map((node, index) => ({
          id: node.attributes.drupal_internal__nid,
          title: node.attributes.title,
          content: node.attributes.body?.processed || node.attributes.body?.value || '',
          image: node.relationships.field_image?.data ? 
            `https://sd-react.ddev.site:8443/sites/default/files/${node.relationships.field_image.data.meta.alt || 'image'}` : null,
          tags: node.relationships.field_tags?.data ? 
            node.relationships.field_tags.data.map(tag => tag.meta.drupal_internal__target_id) : []
        }));
        
        setTips(transformedTips);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tips:', error);
        setLoading(false);
      }
    };
    
    fetchTips();
  }, []);

  const handleTipSelect = (tipIndex) => {
    setSelectedTip(tips[tipIndex]);
  };

  const handleCloseDetail = () => {
    setSelectedTip(null);
  };

  if (loading) {
    return <div className="loading">Loading tips...</div>;
  }

  return (
    <div className="App">
      <TipList tips={tips} onTipSelect={handleTipSelect} />
      {selectedTip && (
        <TipDetail tip={selectedTip} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default App;
