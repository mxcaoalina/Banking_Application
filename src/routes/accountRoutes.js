const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { validateTransaction } = require('../middleware/validation');

// Account routes
router.post('/create', accountController.createAccount);
router.post('/login', accountController.login);
router.post('/update', validateTransaction, accountController.updateBalance);
router.post('/findOne', accountController.findUser);
router.get('/balance/:email', accountController.getBalance);
router.post('/update-password', accountController.updatePassword);

module.exports = router; 