const router = require('express').Router();
const generateLayerData = require('../lib/generateLayerData');

router.get('/api', async (req, res) => {
    const layerData = await generateLayerData()
    res.status(200).json(layerData);
})

module.exports = router;