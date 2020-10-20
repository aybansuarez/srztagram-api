const express = require('express');

const User = require('../models/User');

const router = express.Router();

router.get('/:id', (req, res) => {
  User.findById(req.params.id)
    .then(user => res.send(user))
    .catch(err => res.status(400).send(err));
});

module.exports = router;