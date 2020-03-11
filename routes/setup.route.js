const router = require('express').Router();
const loadCSVs = require('../handlers/loadData');

router.get('/', (req, res) => {
    loadCSVs();
    res.send('hello');
});

module.exports = router;