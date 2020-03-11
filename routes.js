'use strict'
const apiRouter = require('./routes/api.route');
const setupRouter = require('./routes/setup.route');

module.exports = function (app, opts) {
  // Setup routes, middleware, and handlers
  app.get('/', (req, res) => {
    res.status(200).json({ msg: "Server is up"})
  })
  app.use('/api', apiRouter)
  app.use('/setup', setupRouter)
}
