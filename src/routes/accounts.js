const express = require('express');
const router = express.Router();

const accountController = require('../controllers/accountController');
const { authenticateToken } = require('../middleware/auth.simple');
const { requireMinRole } = require('../middleware/rbac');
const { validate, validateId, accountSchemas, querySchemas } = require('../middleware/validation');

/**
 * @route POST /api/accounts
 * @desc Create new account
 * @access Private (Admin+)
 * @body {account_name, user_id, account_type?, initial_balance?}
 */
router.post('/',
  authenticateToken,
  requireMinRole('admin'),
  validate(accountSchemas.create),
  accountController.createAccount
);

/**
 * @route GET /api/accounts
 * @desc Get all accounts with pagination and filtering
 * @access Private (Admin+ or Own Accounts for Users)
 * @query {limit?, offset?, user_id?, account_type?, is_active?}
 */
router.get('/',
  authenticateToken,
  validate(querySchemas.pagination, 'query'),
  accountController.getAccounts
);

/**
 * @route GET /api/accounts/:id
 * @desc Get account by ID
 * @access Private (Admin+ or Account Owner)
 * @params {id}
 */
router.get('/:id',
  authenticateToken,
  validateId(),
  accountController.getAccountById
);

/**
 * @route PATCH /api/accounts/:id
 * @desc Update account
 * @access Private (Admin+ or Account Owner)
 * @params {id}
 * @body {account_name?, account_type?}
 */
router.patch('/:id',
  authenticateToken,
  validateId(),
  validate(accountSchemas.update),
  accountController.updateAccount
);

/**
 * @route POST /api/accounts/:id/funds
 * @desc Add funds to account
 * @access Private (Admin+)
 * @params {id}
 * @body {amount, funding_source, description?}
 */
router.post('/:id/funds',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  validate(accountSchemas.addFunds),
  accountController.addFunds
);

/**
 * @route DELETE /api/accounts/:id
 * @desc Delete account
 * @access Private (Admin+)
 * @params {id}
 */
router.delete('/:id',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  accountController.deleteAccount
);

module.exports = router;
