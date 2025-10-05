const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

class AuthController {
  // Admin login
  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
          { type: 'admin', username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          user: { type: 'admin', username }
        });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  // User login (account owners and users)
  async userLogin(req, res) {
    try {
      const { email } = req.body;

      // Find user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*, accounts(*)')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const token = jwt.sign(
        {
          type: 'user',
          userId: user.id,
          accountId: user.account_id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store session
      await supabase.from('sessions').insert({
        user_id: user.id,
        user_type: 'user',
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accountId: user.account_id,
          accountName: user.accounts.name
        }
      });
    } catch (error) {
      console.error('User login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      if (req.user.type === 'admin') {
        return res.json({
          type: 'admin',
          username: req.user.username
        });
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*, accounts(*)')
        .eq('id', req.user.userId)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountId: user.account_id,
        accountName: user.accounts.name
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  }
}

module.exports = new AuthController();
