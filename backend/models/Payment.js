const { db } = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { invoiceNo, name, phone, location, amount, frequency, date, status = 'Paid', userId } = paymentData;
    const [result] = await db.execute(
      'INSERT INTO payments (invoice_no, name, phone, location, amount, frequency, date, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [invoiceNo, name, phone, location, amount, frequency, date, status, userId]
    );
    return { id: result.insertId, ...paymentData };
  }

  static async find(query = {}) {
    let sql = 'SELECT id, invoice_no as invoiceNo, name, phone, location, amount, frequency, date, status, user_id as userId, created_at as createdAt, updated_at as updatedAt FROM payments';
    let params = [];
    let conditions = [];

    if (query.userId) {
      conditions.push('user_id = ?');
      params.push(query.userId);
    }

    if (query.frequency) {
      conditions.push('frequency = ?');
      params.push(query.frequency);
    }

    if (query.date) {
      if (query.date.$gte) {
        conditions.push('date >= ?');
        params.push(query.date.$gte.toISOString().split('T')[0]);
      }
      if (query.date.$lte) {
        conditions.push('date <= ?');
        params.push(query.date.$lte.toISOString().split('T')[0]);
      }
    }

    if (query.$or) {
      const orConditions = query.$or.map(condition => {
        if (condition.name) {
          params.push(`%${condition.name.$regex}%`);
          return 'name LIKE ?';
        }
        if (condition.phone) {
          params.push(`%${condition.phone.$regex}%`);
          return 'phone LIKE ?';
        }
        if (condition.invoiceNo) {
          params.push(`%${condition.invoiceNo.$regex}%`);
          return 'invoice_no LIKE ?';
        }
      }).filter(Boolean);
      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, invoice_no as invoiceNo, name, phone, location, amount, frequency, date, status, user_id as userId, created_at as createdAt, updated_at as updatedAt FROM payments WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByIdAndDelete(id) {
    const [result] = await db.execute('DELETE FROM payments WHERE id = ?', [id]);
    return { deletedCount: result.affectedRows };
  }

  static async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM payments';
    let params = [];
    let conditions = [];

    if (query.date && query.date.$gte) {
      conditions.push('date >= ?');
      params.push(query.date.$gte.toISOString().split('T')[0]);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await db.execute(sql, params);
    return rows[0].count;
  }

  static async aggregate() {
    const [rows] = await db.execute('SELECT SUM(amount) as total FROM payments');
    return [{ total: rows[0].total || 0 }];
  }
}

module.exports = Payment;