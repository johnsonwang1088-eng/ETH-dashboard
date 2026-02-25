import React, { useState, useEffect } from 'react';

const XTrending = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/eth/trending');
      if (!response.ok) throw new Error('Failed to fetch trending data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-lg p-4 shadow">Loading trending topics...</div>;
  if (error) return <div className="bg-white rounded-lg p-4 shadow text-red-600">Error: {error}</div>;
  if (!data) return <div className="bg-white rounded-lg p-4 shadow">No data available</div>;

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold mb-4">X.com 热点话题</h2>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="border rounded p-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer" 
                  title={item.title}
                  onClick={() => window.open(item.link, '_blank')}>
                {item.title}
              </h3>
              {item.specialUser && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.specialUser}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2">{item.snippet}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{item.date}</span>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:underline"
              >
                查看原文 →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default XTrending;
