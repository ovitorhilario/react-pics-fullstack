const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  // 1. Ativar modo WAL (Write-Ahead Logging)
  db.run('PRAGMA journal_mode = WAL', (err) => {
    if (err) console.error('Erro ao ativar WAL:', err);
    else console.log('Modo SQLite WAL ativado.');
  });

  // 2. Habilitar verificação de chaves estrangeiras
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) console.error('Erro ao ativar chaves estrangeiras:', err);
  });

  // 3. Criar tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // 4. Criar tabela de imagens
  db.run(`
    CREATE TABLE IF NOT EXISTS pictures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 5. Semear tabela de usuários caso esteja vazia
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (err) {
      console.error('Erro ao verificar tabela users:', err);
      return;
    }
    if (row.count === 0) {
      console.log('Semeando tabela users...');
      const adminHash = bcrypt.hashSync('admin123', 10);
      const userHash = bcrypt.hashSync('user123', 10);

      db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', adminHash]);
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['user', userHash], (err) => {
        if (!err) {
          seedPictures();
        }
      });
    } else {
      seedPictures();
    }
  });
});

function seedPictures() {
  db.get('SELECT COUNT(*) as count FROM pictures', [], (err, row) => {
    if (err) {
      console.error('Erro ao verificar tabela pictures:', err);
      return;
    }
    if (row.count === 0) {
      console.log('Semeando tabela pictures...');
      const picturesSeed = [
        { title: "Ponte de Madeira", url: "https://picsum.photos/id/10/2500/1667", width: 2500, height: 1667, username: "admin" },
        { title: "Frutas Tropicais", url: "https://picsum.photos/id/102/4320/3240", width: 4320, height: 3240, username: "user" },
        { title: "Café da Manhã", url: "https://picsum.photos/id/1060/5598/3732", width: 5598, height: 3732, username: "admin" },
        { title: "Paisagem de Outono", url: "https://picsum.photos/id/1043/5184/3456", width: 5184, height: 3456, username: "user" },
        { title: "Cachorrinho Fofo", url: "https://picsum.photos/id/237/3500/2095", width: 3500, height: 2095, username: "admin" },
        { title: "Laptop de Trabalho", url: "https://picsum.photos/id/3/5000/3333", width: 5000, height: 3333, username: "user" }
      ];

      picturesSeed.forEach(pic => {
        db.get('SELECT id FROM users WHERE username = ?', [pic.username], (err, userRow) => {
          if (userRow) {
            db.run(
              'INSERT INTO pictures (title, url, width, height, user_id) VALUES (?, ?, ?, ?, ?)',
              [pic.title, pic.url, pic.width, pic.height, userRow.id]
            );
          }
        });
      });
    }
  });
}

module.exports = db;
