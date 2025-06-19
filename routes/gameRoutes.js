const express = require('express');
const path = require('path'); // add this
const router = express.Router();



router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-client.html')); // use path.join to resolve HTML file
});

module.exports = router;
