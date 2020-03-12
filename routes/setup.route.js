const router = require('express').Router();
const loadCSVs = require('../handlers/loadData');

router.get('/', async (req, res) => {
    const confirmed = await loadCSVs({ filename: "Confirmed"});
    const deaths = await loadCSVs({ filename: "Deaths"});
    const recovered = await loadCSVs({ filename: "Recovered"});
    res.status(200).json({
        confirmed,
        deaths,
        recovered
    });
});

module.exports = router;