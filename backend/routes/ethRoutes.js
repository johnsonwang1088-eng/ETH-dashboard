import express from 'express';
import coinMarketCapService from '../services/coinMarketCapService.js';
import beaconchainService from '../services/beaconchainService.js';
import etherscanService from '../services/etherscanService.js';
import ultrasoundService from '../services/ultrasoundService.js';
import l2beatService from '../services/l2beatService.js';
import googleSearchService from '../services/googleSearchService.js';
import scan8004Service from '../services/scan8004Service.js';

const router = express.Router();

router.get('/market', async (req, res) => {
  try {
    const data = await coinMarketCapService.getETHMarketData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fundamental', async (req, res) => {
  try {
    const [beaconchain, ultrasound, l2beat] = await Promise.all([
      beaconchainService.getBeaconchainData(),
      ultrasoundService.getSupplyData(),
      l2beatService.getL2Data()
    ]);

    res.json({
      beaconchain,
      ultrasound,
      l2beat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gas', async (req, res) => {
  try {
    const [gasData, topConsumers] = await Promise.all([
      etherscanService.getGasData(),
      etherscanService.getTopGasConsumers()
    ]);

    res.json({
      gasData,
      topConsumers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const data = await googleSearchService.getXTrending();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/scan8004', async (req, res) => {
  try {
    const data = await scan8004Service.getScan8004Data();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
