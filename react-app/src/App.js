import React, { useState, useEffect } from 'react';
import TipList from './TipList';
import TipDetail from './TipDetail';
import './App.css';

function App() {
  console.log('App component rendering');
  const [tips, setTips] = useState([]);
  const [selectedTip, setSelectedTip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real tips from Drupal JSON:API
  useEffect(() => {
    const fetchTips = async () => {
      try {
        // Get all article nodes from Drupal JSON:API with image data included
        const response = await fetch('/jsonapi/node/article?include=field_image', {
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
        console.log('API Response:', data);
        
        // Transform JSON:API data to our format
        const transformedTips = data.data.map((node, index) => {
          // Find the image file data from the included relationships
          let imageUrl = null;
          if (node.relationships.field_image?.data && data.included) {
            const imageFile = data.included.find(item => 
              item.type === 'file--file' && 
              item.id === node.relationships.field_image.data.id
            );
            if (imageFile && imageFile.attributes.uri) {
              // Convert Drupal file URI to imagecache URL
              const baseUrl = imageFile.attributes.uri.url;
              // Replace the base path with the imagecache version
              imageUrl = `https://sd-react.ddev.site:8443${baseUrl.replace('/sites/default/files/', '/sites/default/files/styles/tips_view_250px/public/')}`;
            }
          }
          
          return {
            id: node.attributes.drupal_internal__nid,
            title: node.attributes.title,
            content: node.attributes.body?.processed || node.attributes.body?.value || '',
            image: imageUrl,
            tags: node.relationships.field_tags?.data ? 
              node.relationships.field_tags.data.map(tag => tag.meta.drupal_internal__target_id) : []
          };
        });
        
        setTips(transformedTips);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tips:', error);
        console.error('Error details:', error.message, error.stack);
        setLoading(false);
      }
    };
    
    fetchTips();
  }, []);

  const handleTipSelect = (tipIndex) => {
    console.log('Tip selected:', tipIndex, tips[tipIndex]);
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
