const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

class User {
  static async create({ username, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    return { id: result.insertId, username, role };
  }

  static async findOne(query) {
    const { username, id } = query;
    let sql, params;
    
    if (username) {
      sql = 'SELECT * FROM users WHERE username = ?';
      params = [username];
    } else if (id) {
      sql = 'SELECT * FROM users WHERE id = ?';
      params = [id];
    }
    
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
  }

  static async countDocuments() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;