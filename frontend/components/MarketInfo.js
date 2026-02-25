import React, { useState, useEffect } from 'react';

const MarketInfo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/eth/market');
      if (!response.ok) throw new Error('Failed to fetch market data');
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

  if (loading) return <div className="bg-white rounded-lg p-4 shadow">Loading market data...</div>;
  if (error) return <div className="bg-white rounded-lg p-4 shadow text-red-600">Error: {error}</div>;
  if (!data) return <div className="bg-white rounded-lg p-4 shadow">No data available</div>;

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold mb-4">Market Info</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-lg font-semibold">${data.price}</div>
        </div>
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">Market Cap</div>
          <div className="text-lg font-semibold">{data.marketCap}</div>
        </div>
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">Circulating Supply</div>
          <div className="text-lg font-semibold">{data.circulatingSupply}</div>
        </div>
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">24h Volume</div>
          <div className="text-lg font-semibold">{data.volume24h}</div>
        </div>
        <div className="border p-3 rounded col-span-2">
          <div className="text-sm text-gray-500">Market Dominance</div>
          <div className="text-lg font-semibold">{data.marketDominance}</div>
        </div>
      </div>
    </div>
  );
};

export default MarketInfo;
