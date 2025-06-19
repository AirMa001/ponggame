const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Multiplayer Pong server is running");
});

module.exports = router;
