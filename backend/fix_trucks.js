const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixTrucksTable() {
  // Corrigir tanto o banco do backend quanto o da raiz
  const databases = [
    path.join(process.cwd(), 'data', 'database.sqlite'),
    path.join(process.cwd(), '..', 'data', 'database.sqlite')
  ];

  for (const dbPath of databases) {
    console.log(`🔄 Corrigindo banco: ${dbPath}`);
    const db = new sqlite3.Database(dbPath);

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Verificar estrutura atual
        db.all('PRAGMA table_info(trucks)', (err, rows) => {
          if (err) {
            console.error('Erro ao verificar trucks:', err);
            resolve();
            return;
          }

          console.log('Estrutura atual da tabela trucks:');
          rows.forEach(row => {
            console.log(`- ${row.name} (${row.type}) ${row.notnull ? 'NOT NULL' : ''}`);
          });

          const hasCapacity = rows.some(row => row.name === 'capacity');

          if (!hasCapacity) {
            console.log('✅ Tabela trucks já está correta!');
            resolve();
            return;
          }

          console.log('🔧 Removendo capacity da tabela trucks...');

          // Criar nova tabela trucks sem capacity
          db.run(`
            CREATE TABLE trucks_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              plate TEXT NOT NULL UNIQUE,
              chassis TEXT NOT NULL UNIQUE,
              model TEXT NOT NULL,
              brand TEXT NOT NULL,
              year INTEGER NOT NULL,
              type TEXT NOT NULL,
              vehicle_category TEXT NOT NULL CHECK(vehicle_category IN ('cavalo', 'carreta', 'dolly')),
              photo TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err && !err.message.includes('table trucks_new already exists')) {
              console.error('Erro ao criar tabela trucks_new:', err);
              resolve();
              return;
            }

            // Migrar dados sem capacity
            db.run(`
              INSERT OR IGNORE INTO trucks_new (id, plate, chassis, model, brand, year, type, vehicle_category, photo, created_at)
              SELECT id, plate, chassis, model, brand, year, type, 
                     CASE 
                       WHEN vehicle_category IS NULL THEN 'cavalo'
                       ELSE vehicle_category 
                     END as vehicle_category,
                     photo, created_at
              FROM trucks
            `, (err) => {
              if (err) {
                console.error('Erro ao migrar dados trucks:', err);
                resolve();
                return;
              }

              // Renomear tabelas
              db.run(`DROP TABLE IF EXISTS trucks_old`, () => {});
              db.run(`ALTER TABLE trucks RENAME TO trucks_old`, () => {});
              db.run(`ALTER TABLE trucks_new RENAME TO trucks`, (err) => {
                if (err) {
                  console.error('Erro ao renomear trucks_new:', err);
                } else {
                  console.log('✅ Tabela trucks corrigida!');
                }
                resolve();
              });
            });
          });
        });
      });
    });

    db.close();
  }
}

if (require.main === module) {
  fixTrucksTable()
    .then(() => {
      console.log('✅ Correção da tabela trucks concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na correção:', error);
      process.exit(1);
    });
}

module.exports = fixTrucksTable; 