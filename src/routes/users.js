const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth.simple');
const { requireMinRole, requireUserManagement } = require('../middleware/rbac');
const { validate, validateId, userSchemas, querySchemas } = require('../middleware/validation');

/**
 * @route POST /api/users
 * @desc Create new user
 * @access Private (Admin+)
 * @body {username, email, password, role, first_name?, last_name?, phone?}
 */
router.post('/',
  authenticateToken,
  requireMinRole('admin'),
  validate(userSchemas.create),
  userController.createUser
);

/**
 * @route GET /api/users
 * @desc Get all users with pagination and filtering
 * @access Private (Admin+)
 * @query {limit?, offset?, role?, is_active?, search?}
 */
router.get('/',
  authenticateToken,
  requireMinRole('admin'),
  validate(querySchemas.pagination, 'query'),
  validate(querySchemas.userFilters, 'query'),
  userController.getUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (Admin+ or Own User)
 * @params {id}
 */
router.get('/:id',
  authenticateToken,
  validateId(),
  userController.getUserById
);

/**
 * @route PATCH /api/users/:id
 * @desc Update user
 * @access Private (Admin+ or Own User)
 * @params {id}
 * @body {email?, first_name?, last_name?, phone?, role?, is_active?}
 */
router.patch('/:id',
  authenticateToken,
  validateId(),
  validate(userSchemas.update),
  requireUserManagement(),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (Admin+)
 * @params {id}
 */
router.delete('/:id',
  authenticateToken,
  requireMinRole('admin'),
  validateId(),
  requireUserManagement(),
  userController.deleteUser
);

module.exports = router;
