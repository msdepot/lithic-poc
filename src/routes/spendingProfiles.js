const express = require('express');
const router = express.Router();

const spendingProfileController = require('../controllers/spendingProfileController');
const { authenticateToken } = require('../middleware/auth.simple');
const { requireMinRole } = require('../middleware/rbac');
const { validate, validateId, spendingProfileSchemas, querySchemas } = require('../middleware/validation');

/**
 * @route POST /api/spending-profiles
 * @desc Create new spending profile
 * @access Private (Admin+)
 * @body {profile_name, description?, daily_limit?, monthly_limit?, per_transaction_limit?, allowed_merchant_categories?, blocked_merchant_categories?}
 */
router.post('/',
  authenticateToken,
  requireMinRole('admin'),
  validate(spendingProfileSchemas.create),
  spendingProfileController.createSpendingProfile
);

/**
 * @route GET /api/spending-profiles
 * @desc Get all spending profiles with pagination
 * @access Private (Admin+)
 * @query {limit?, offset?, is_active?}
 */
router.get('/',
  authenticateToken,
  requireMinRole('admin'),
  validate(querySchemas.pagination, 'query'),
  spendingProfileController.getSpendingProfiles
);

/**
 * @route GET /api/spending-profiles/:id
 * @desc Get spending profile by ID
 * @access Private (Admin+)
 * @params {id}
 */
router.get('/:id',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  spendingProfileController.getSpendingProfileById
);

/**
 * @route PATCH /api/spending-profiles/:id
 * @desc Update spending profile
 * @access Private (Admin+)
 * @params {id}
 * @body {profile_name?, description?, daily_limit?, monthly_limit?, per_transaction_limit?, allowed_merchant_categories?, blocked_merchant_categories?}
 */
router.patch('/:id',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  validate(spendingProfileSchemas.update),
  spendingProfileController.updateSpendingProfile
);

/**
 * @route DELETE /api/spending-profiles/:id
 * @desc Delete spending profile
 * @access Private (Admin+)
 * @params {id}
 */
router.delete('/:id',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  spendingProfileController.deleteSpendingProfile
);

/**
 * @route GET /api/spending-profiles/:id/cards
 * @desc Get cards attached to spending profile
 * @access Private (Admin+)
 * @params {id}
 */
router.get('/:id/cards',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  spendingProfileController.getProfileCards
);

module.exports = router;
