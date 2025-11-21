import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai'; 
import './App.css';


const PRODUCTS = [
  { id: 1, name: "Pixel 7", price: 33999, category: "Phone", description: "Google's smart AI phone with excellent camera." },
  { id: 2, name: "iPhone 14 Pro", price: 119900, category: "Phone", description: "Apple's flagship with Dynamic Island." },
  { id: 3, name: "Samsung Galaxy A54", price: 25999, category: "Phone", description: "Great mid-range Android phone with good battery." },
  { id: 4, name: "MacBook Air M2", price: 83900, category: "Laptop", description: "Lightweight, powerful, and silent." },
  { id: 5, name: "Dell XPS 13", price: 110000, category: "Laptop", description: "Compact Windows ultrabook with stunning display." },
  { id: 6, name: "Sony WH-1000XM5", price: 26990, category: "Headphones", description: "Industry-leading noise canceling headphones." },
  { id: 7, name: "Budget Bass Earbuds", price: 1499, category: "Headphones", description: "Cheap wireless earbuds with deep bass." },
  { id: 8, name: "Gaming Laptop Titan", price: 245000, category: "Laptop", description: "High performance gaming beast with RTX 4080." },
  { id: 9, name: "Kindle Paperwhite", price: 14999, category: "Tablet", description: "Perfect for reading in direct sunlight." },
  { id: 10, name: "iPad Air", price: 59900, category: "Tablet", description: "Versatile tablet for creatives and students." },
];


const API_KEY = "AIzaSyDu9aaYT3iFy0ezwgyQtezzGaaXtPf2ftQ"; 


const ai = new GoogleGenAI({ apiKey: API_KEY });

function App() {
  const [userInput, setUserInput] = useState('');
  const [recommendations, setRecommendations] = useState(PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRecommendations = async () => {
    if (!userInput.trim() || API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
        setError("Error: Please enter the Gemini API Key.");
        return;
    }
    
    setLoading(true);
    setError('');

    
    const systemInstruction = `
      You are a powerful JSON-output shopping assistant for an Indian electronics store.
      Your only job is to analyze the user's request against the provided product list and return a JSON array of the best matching product IDs.
      The output MUST be a JSON array of integers only. Prices are in INR (₹).
      
      Available Products: ${JSON.stringify(PRODUCTS)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: userInput,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json", 
                responseSchema: {
                    type: "array",
                    items: {
                        type: "integer"
                    }
                },
                temperature: 0.1
            },
        });

      
      let aiContent = response.text.trim();
      
      
      const recommendedIds = JSON.parse(aiContent);
      
      const filteredProducts = PRODUCTS.filter(product => recommendedIds.includes(product.id));
      
      setRecommendations(filteredProducts);
      setError(``);

    } catch (err) {
      console.error("Gemini API Error:", err);
      
      setError(`Error getting recommendations. Check your Gemini API Key or the console (F12) for network errors.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>AI Product Recommender</h1>
      </header>

      <main>
        {/* Input Section */}
        <div className="search-section">
          <textarea
            placeholder="Example: I need a cheap phone for under ₹30,000 for my sister."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
          />
          <button onClick={getRecommendations} disabled={loading || !userInput || API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE"}>
            {loading ? 'Thinking...' : 'Get Recommendations'}
          </button>
        </div>

        {/* Error/Status Display */}
        {error && <div className="status-msg">{error}</div>}

        {/* Product Grid */}
        <div className="product-grid">
          {recommendations.length > 0 ? (
            recommendations.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <span className="category">{product.category}</span>
                <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
                <p className="desc">{product.description}</p>
              </div>
            ))
          ) : (
            <p className="no-results">No products match that description.</p>
          )}
        </div>

        {/* Reset Button */}
        {recommendations.length !== PRODUCTS.length && (
          <button className="reset-btn" onClick={() => {
            setRecommendations(PRODUCTS);
            setUserInput('');
            setError('');
          }}>
            Show All Products
          </button>
        )}
      </main>
    </div>
  );
}

export default App;