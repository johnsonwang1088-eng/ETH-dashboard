import React, { useState, useEffect } from 'react';
import MarketInfo from './components/MarketInfo';
import ETHFundamental from './components/ETHFundamental';
import XTrending from './components/XTrending';
import Scan8004Stats from './components/Scan8004Stats';

const Dashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setLastUpdate(new Date().toLocaleTimeString());
    window.location.reload();
  };

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
    
    const interval = setInterval(() => {
      console.log('Auto refreshing data...');
      window.location.reload();
    }, 900000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Ethereum Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Last update: {lastUpdate}
            </span>
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <Scan8004Stats />
          </div>
          <div className="lg:col-span-1">
            <MarketInfo />
          </div>
          <div className="lg:col-span-1">
            <ETHFundamental />
          </div>
          <div className="lg:col-span-2">
            <XTrending />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
