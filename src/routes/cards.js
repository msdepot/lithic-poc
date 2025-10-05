const express = require('express');
const router = express.Router();

const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth.simple');
const { requireMinRole } = require('../middleware/rbac');
const { validate, validateId, cardSchemas, querySchemas } = require('../middleware/validation');

/**
 * @route POST /api/cards
 * @desc Create new card
 * @access Private (Admin+)
 * @body {user_id, account_id, card_type, card_subtype?, spending_profile_id?, custom_limits?, memo?}
 */
router.post('/',
  authenticateToken,
  requireMinRole('admin'),
  validate(cardSchemas.create),
  cardController.createCard
);

/**
 * @route GET /api/cards
 * @desc Get all cards with pagination and filtering
 * @access Private (Admin+ or Own Cards for Users)
 * @query {limit?, offset?, user_id?, account_id?, card_type?, status?}
 */
router.get('/',
  authenticateToken,
  validate(querySchemas.pagination, 'query'),
  validate(querySchemas.cardFilters, 'query'),
  cardController.getCards
);

/**
 * @route GET /api/cards/:id
 * @desc Get card by ID
 * @access Private (Admin+ or Card Owner)
 * @params {id}
 */
router.get('/:id',
  authenticateToken,
  validateId(),
  cardController.getCardById
);

/**
 * @route PATCH /api/cards/:id
 * @desc Update card
 * @access Private (Admin+ or Card Owner)
 * @params {id}
 * @body {spending_profile_id?, custom_limits?, memo?}
 */
router.patch('/:id',
  authenticateToken,
  validateId(),
  validate(cardSchemas.update),
  cardController.updateCard
);

/**
 * @route PATCH /api/cards/:id/status
 * @desc Update card status
 * @access Private (Admin+ or Card Owner)
 * @params {id}
 * @body {status, reason?}
 */
router.patch('/:id/status',
  authenticateToken,
  validateId(),
  validate(cardSchemas.updateStatus),
  cardController.updateCardStatus
);

/**
 * @route GET /api/cards/:id/limits
 * @desc Get card spending limits and current usage
 * @access Private (Admin+ or Card Owner)
 * @params {id}
 */
router.get('/:id/limits',
  authenticateToken,
  validateId(),
  cardController.getCardLimits
);

module.exports = router;
