const db = require('../config/database');

const pictureModel = {
  /**
   * Busca imagens com paginação e busca por termo.
   * @param {object} filters
   * @param {string} filters.search
   * @param {number} filters.limit
   * @param {number} filters.offset
   * @returns {Promise<object[]>}
   */
  findAll: ({ search, limit, offset }) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.id, p.title, p.url, p.width, p.height, u.username as author
        FROM pictures p
        JOIN users u ON p.user_id = u.id
      `;
      const params = [];

      if (search) {
        query += ` WHERE p.title LIKE ? OR u.username LIKE ?`;
        const pattern = `%${search}%`;
        params.push(pattern, pattern);
      }

      query += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * Conta a quantidade total de imagens compatíveis com o filtro de busca.
   * @param {object} filters
   * @param {string} filters.search
   * @returns {Promise<number>}
   */
  countAll: ({ search }) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT COUNT(*) as count 
        FROM pictures p
        JOIN users u ON p.user_id = u.id
      `;
      const params = [];

      if (search) {
        query += ` WHERE p.title LIKE ? OR u.username LIKE ?`;
        const pattern = `%${search}%`;
        params.push(pattern, pattern);
      }

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  },

  /**
   * Insere uma nova imagem no banco de dados.
   * @param {object} picture
   * @param {string} picture.title
   * @param {string} picture.url
   * @param {number} picture.width
   * @param {number} picture.height
   * @param {number} picture.user_id
   * @returns {Promise<object>}
   */
  create: ({ title, url, width, height, user_id }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pictures (title, url, width, height, user_id) VALUES (?, ?, ?, ?, ?)',
        [title, url, width, height, user_id],
        function (err) {
          if (err) reject(err);
          else {
            resolve({ id: this.lastID, title, url, width, height, user_id });
          }
        }
      );
    });
  }
};

module.exports = pictureModel;
