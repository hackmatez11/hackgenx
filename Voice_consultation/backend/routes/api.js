const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

router.post('/create-call', callController.createCall);
router.post('/create-web-call', callController.createWebCall);
router.post('/webhook', callController.handleWebhook);
router.get('/latest-call', callController.getLatestCall);

module.exports = router;
