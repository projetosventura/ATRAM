const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco:', err);
      process.exit(1);
    }
    console.log('Conectado ao banco SQLite para migração');
  });

  try {
    // Verificar se as colunas existem antes de tentar removê-las
    const checkColumns = (tableName) => {
      return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) reject(err);
          else resolve(columns.map(col => col.name));
        });
      });
    };

    // Remover colunas da tabela inspection_requests se existirem
    const inspectionColumns = await checkColumns('inspection_requests');
    
    if (inspectionColumns.includes('tire_condition')) {
      console.log('Removendo coluna tire_condition da tabela inspection_requests...');
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE inspection_requests DROP COLUMN tire_condition', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    if (inspectionColumns.includes('oil_level')) {
      console.log('Removendo coluna oil_level da tabela inspection_requests...');
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE inspection_requests DROP COLUMN oil_level', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Verificar se existe a tabela inspections e remover colunas se necessário
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });

    if (tables.includes('inspections')) {
      const inspectionTableColumns = await checkColumns('inspections');
      
      if (inspectionTableColumns.includes('tire_condition')) {
        console.log('Removendo coluna tire_condition da tabela inspections...');
        await new Promise((resolve, reject) => {
          db.run('ALTER TABLE inspections DROP COLUMN tire_condition', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      if (inspectionTableColumns.includes('oil_level')) {
        console.log('Removendo coluna oil_level da tabela inspections...');
        await new Promise((resolve, reject) => {
          db.run('ALTER TABLE inspections DROP COLUMN oil_level', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    db.close();
  }
}

// Executar migração se o arquivo for chamado diretamente
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase; 