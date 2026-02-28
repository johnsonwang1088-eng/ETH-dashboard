import React, { useState, useEffect } from 'react';

const ETHFundamental = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/eth/fundamental');
      if (!response.ok) throw new Error('Failed to fetch fundamental data');
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

  if (loading) return <div className="bg-white rounded-lg p-4 shadow">Loading fundamental data...</div>;
  if (error) return <div className="bg-white rounded-lg p-4 shadow text-red-600">Error: {error}</div>;
  if (!data) return <div className="bg-white rounded-lg p-4 shadow">No data available</div>;

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold mb-4">ETH Fundamental</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Beaconchain</h3>
          <div className="space-y-2 text-sm">
            <div>Staked ETH: <span className="font-semibold">{data.beaconchain.stakedETH}</span></div>
            <div>Joining Queue: <span className="font-semibold">{data.beaconchain.joiningQueue}</span></div>
            <div>Leaving Queue: <span className="font-semibold">{data.beaconchain.leavingQueue}</span></div>
            <div>Epoch: <span className="font-semibold">{data.beaconchain.epoch}</span></div>
            <div>Slot: <span className="font-semibold">{data.beaconchain.slot}</span></div>
          </div>
        </div>
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Ultrasound Money</h3>
          <div className="space-y-2 text-sm">
            <div>Supply Change: <span className="font-semibold">{data.ultrasound.supplyChange}</span></div>
            <div>Burned (7d): <span className="font-semibold">{data.ultrasound.burned7d}</span></div>
            <div>Issued (7d): <span className="font-semibold">{data.ultrasound.issued7d}</span></div>
            <div>Supply Growth: <span className="font-semibold">{data.ultrasound.supplyGrowth}</span></div>
            <div>Blob Fee Burn: <span className="font-semibold">{data.ultrasound.blobFeeBurn}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 md:col-span-2">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">L2Beat Value Secured</h3>
            <div className="text-lg font-semibold">{data.l2beat.valueSecured}</div>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Total Value Locked in DeFi</h3>
            <div className="text-lg font-semibold">{data.defillama.tvl}</div>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Average Gas</h3>
            <div className="text-lg font-semibold">{data.gas.averageGasPrice}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETHFundamental;
