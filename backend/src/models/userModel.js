const db = require('../config/database');

const userModel = {
  /**
   * Busca um usuário pelo nome de usuário.
   * @param {string} username 
   * @returns {Promise<object|null>}
   */
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },

  /**
   * Busca um usuário pelo ID (sem retornar o hash de senha).
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },

  /**
   * Cria um novo usuário.
   * @param {string} username 
   * @param {string} passwordHash 
   * @returns {Promise<object>}
   */
  create: (username, passwordHash) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, passwordHash],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username });
        }
      );
    });
  }
};

module.exports = userModel;
