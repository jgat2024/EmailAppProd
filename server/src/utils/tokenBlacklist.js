const jwt = require('jsonwebtoken');

class TokenBlacklist {
  constructor() {
    this.tokens = new Map();
    setInterval(() => this.cleanup(), 60 * 1000).unref();
  }

  add(token) {
    try {
      const decoded = jwt.decode(token);
      const exp = decoded && decoded.exp ? decoded.exp * 1000 : Date.now();
      this.tokens.set(token, exp);
    } catch (error) {
      this.tokens.set(token, Date.now());
    }
  }

  has(token) {
    const expiresAt = this.tokens.get(token);
    if (!expiresAt) {
      return false;
    }
    if (expiresAt < Date.now()) {
      this.tokens.delete(token);
      return false;
    }
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [token, exp] of this.tokens.entries()) {
      if (exp < now) {
        this.tokens.delete(token);
      }
    }
  }
}

module.exports = new TokenBlacklist();
