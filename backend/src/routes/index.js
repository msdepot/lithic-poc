const express = require('express');
const authController = require('../controllers/auth.controller');
const accountController = require('../controllers/account.controller');
const userController = require('../controllers/user.controller');
const cardController = require('../controllers/card.controller');
const spendingProfileController = require('../controllers/spending-profile.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/auth/admin/login', authController.adminLogin);
router.post('/auth/user/login', authController.userLogin);
router.get('/auth/me', authenticateToken, authController.getCurrentUser);

// Account routes (admin only)
router.post('/accounts', authenticateToken, isAdmin, accountController.createAccount);
router.get('/accounts', authenticateToken, isAdmin, accountController.listAccounts);
router.get('/accounts/:id', authenticateToken, isAdmin, accountController.getAccount);

// User routes (authenticated users)
router.post('/users', authenticateToken, userController.createUser);
router.get('/users', authenticateToken, userController.listUsers);
router.get('/users/:id', authenticateToken, userController.getUser);

// Card routes (authenticated users)
router.post('/cards', authenticateToken, cardController.createCard);
router.get('/cards', authenticateToken, cardController.listCards);
router.get('/cards/:id', authenticateToken, cardController.getCard);

// Spending profile routes (authenticated users)
router.post('/spending-profiles', authenticateToken, spendingProfileController.createProfile);
router.get('/spending-profiles', authenticateToken, spendingProfileController.listProfiles);
router.get('/spending-profiles/:id', authenticateToken, spendingProfileController.getProfile);

module.exports = router;
