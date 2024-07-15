const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/checkToken', authMiddleware, (req, res) => {
    res.sendStatus(200);
  });


module.exports = router;
