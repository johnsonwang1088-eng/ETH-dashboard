import React, { useState, useEffect } from 'react';

const Scan8004Stats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/eth/scan8004');
      if (!response.ok) throw new Error('Failed to fetch scan8004 data');
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

  if (loading) return <div className="bg-white rounded-lg p-4 shadow">Loading scan8004 data...</div>;
  if (error) return <div className="bg-white rounded-lg p-4 shadow text-red-600">Error: {error}</div>;
  if (!data) return <div className="bg-white rounded-lg p-4 shadow">No data available</div>;

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">8004scan.io 统计数据</h2>
        <button
          onClick={fetchData}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          刷新
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500 mb-1">Registered Agents</div>
          <div className="text-2xl font-bold text-blue-600">
            {parseInt(data.registeredAgents).toLocaleString()}
          </div>
        </div>
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500 mb-1">Feedback Submitted</div>
          <div className="text-2xl font-bold text-green-600">
            {parseInt(data.feedbackSubmitted).toLocaleString()}
          </div>
        </div>
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500 mb-1">Active Users</div>
          <div className="text-2xl font-bold text-purple-600">
            {parseInt(data.activeUsers).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        数据来源: 8004scan.io API
      </div>
    </div>
  );
};

export default Scan8004Stats;
