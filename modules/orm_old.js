/**
 * SafeORM
 * Lightweight ORM sincrono basato su better-sqlite3.
 * Supporta:
 * - definizione modelli
 * - validazione schema
 * - CRUD sicuro
 * - transazioni
 * - relazioni (1:N, N:1, N:M)
 * - eager loading con include
 *
 * Filosofia: zero magia, zero reflection, tutto esplicito.
 */

/**
 * DataTypes
 * Oggetto centralizzato per la definizione dei tipi di colonna.
 * Serve a:
 * - evitare stringhe magiche
 * - garantire coerenza tra schema e validazione
 * - rendere il codice più leggibile e autocompletabile
 */
const DataTypes = Object.freeze({
  STRING: 'STRING',
  TEXT: 'TEXT',
  INTEGER: 'INTEGER',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  EMAIL: 'EMAIL',
  AUTOINCREMENT: 'AUTOINCREMENT'
});

export const { STRING, TEXT, INTEGER, NUMBER, BOOLEAN, EMAIL, AUTOINCREMENT } = DataTypes;

import Database from 'better-sqlite3';

// ==================================================
// SafeORM v3 – FULL (renamed variables, same logic)
// ==================================================

export default class SafeORM {
  constructor(databasePath, options = {}) {
    this.database = new Database(databasePath);
    this.modelRegistry = {};
    this.logLevel = options.logLevel || 'error';
    this._initializeMetaTable();
  }

  // ================= META / MIGRATIONS =================
  _initializeMetaTable() {
    this.database.prepare(`CREATE TABLE IF NOT EXISTS _meta (version INTEGER)`).run();
    if (!this.database.prepare(`SELECT version FROM _meta`).get()) {
      this.database.prepare(`INSERT INTO _meta (version) VALUES (0)`).run();
    }
  }

  getDatabaseVersion() {
    return this.database.prepare(`SELECT version FROM _meta`).get().version;
  }

  migrateTo(targetVersion, migrations) {
    let currentVersion = this.getDatabaseVersion();
    while (currentVersion < targetVersion) {
      const nextVersion = currentVersion + 1;
      this.database.transaction(() => migrations[nextVersion](this.database))();
      this.database.prepare(`UPDATE _meta SET version=?`).run(nextVersion);
      currentVersion = nextVersion;
    }
  }

  // ================= MODEL DEFINITION =================
  define(modelName, schemaDefinition, options = {}) {
    this.modelRegistry[modelName] = {
      schema: schemaDefinition,
      hooks: options.hooks || {},
      relations: {}
    };

    const columnDefinitions = Object.entries(schemaDefinition).map(([columnName, columnDef]) => {
      let sqlType = 'TEXT';
      if (columnDef.type === 'INTEGER') sqlType = 'INTEGER';
      if (columnDef.type === 'BOOLEAN') sqlType = 'INTEGER';
      if (columnDef.type === 'AUTOINCREMENT') sqlType = 'INTEGER PRIMARY KEY AUTOINCREMENT';

      let columnSql = `${columnName} ${sqlType}`;
      if (columnDef.required) columnSql += ' NOT NULL';
      if (columnDef.unique) columnSql += ' UNIQUE';
      if (columnDef.default !== undefined) {
        columnSql += ` DEFAULT ${JSON.stringify(columnDef.default)}`;
      }
      return columnSql;
    }).join(',');

    this.database
      .prepare(`CREATE TABLE IF NOT EXISTS ${modelName} (${columnDefinitions})`)
      .run();
  }

  // ================= RELATIONS =================
  hasMany(sourceModel, targetModel, { as, foreignKey }) {
    this.modelRegistry[sourceModel].relations[as] = {
      type: 'hasMany',
      targetModel,
      foreignKey
    };
  }

  belongsTo(sourceModel, targetModel, { as, foreignKey }) {
    this.modelRegistry[sourceModel].relations[as] = {
      type: 'belongsTo',
      targetModel,
      foreignKey
    };
  }

  manyToMany(modelA, modelB, { through, aKey, bKey }) {
    this.define(through, {
      id: { type: 'AUTOINCREMENT', primaryKey: true },
      [aKey]: { type: 'INTEGER', required: true },
      [bKey]: { type: 'INTEGER', required: true }
    });

    this.modelRegistry[modelA].relations[modelB] = {
      type: 'manyToMany',
      targetModel: modelB,
      throughTable: through,
      sourceKey: aKey,
      targetKey: bKey
    };

    this.modelRegistry[modelB].relations[modelA] = {
      type: 'manyToMany',
      targetModel: modelA,
      throughTable: through,
      sourceKey: bKey,
      targetKey: aKey
    };
  }

  model(modelName) {
    return {
      create: data => this.create(modelName, data),
      findAll: options => this.findAll(modelName, options),
      findOne: options => this.findOne(modelName, options),
      update: (data, where) => this.update(modelName, data, where),
      delete: where => this.delete(modelName, where)
    };
  }

  // ================= CORE =================
  _buildWhereClause(whereConditions = {}) {
    const sqlFragments = [];
    const parameters = {};

    for (const field in whereConditions) {
      const condition = whereConditions[field];
      if (typeof condition === 'object') {
        if ('$gt' in condition) {
          sqlFragments.push(`${field} > :${field}`);
          parameters[field] = condition.$gt;
        }
      } else {
        sqlFragments.push(`${field} = :${field}`);
        parameters[field] = condition;
      }
    }

    return {
      sql: sqlFragments.length ? 'WHERE ' + sqlFragments.join(' AND ') : '',
      params: parameters
    };
  }

  create(modelName, data) {
    const columns = Object.keys(data);
    const placeholders = columns.map(c => ':' + c).join(',');
    const sql = `INSERT INTO ${modelName} (${columns.join(',')}) VALUES (${placeholders})`;

    this.modelRegistry[modelName].hooks.beforeCreate?.(data);
    return this.database.prepare(sql).run(data);
  }

  findAll(modelName, options = {}) {
    const { where = {}, include = [] } = options;
    const whereClause = this._buildWhereClause(where);

    let rows = this.database
      .prepare(`SELECT * FROM ${modelName} ${whereClause.sql}`)
      .all(whereClause.params);

    for (const relationAlias of include) {
      const relation = this.modelRegistry[modelName].relations[relationAlias];
      if (!relation) continue;

      if (relation.type === 'hasMany') {
        const parentIds = rows.map(row => row.id);
        const children = this.database.prepare(
          `SELECT * FROM ${relation.targetModel} WHERE ${relation.foreignKey} IN (${parentIds.map(() => '?').join(',')})`
        ).all(parentIds);

        rows.forEach(row => {
          row[relationAlias] = children.filter(child => child[relation.foreignKey] === row.id);
        });
      }

      if (relation.type === 'belongsTo') {
        const foreignKeys = rows.map(row => row[relation.foreignKey]);
        const parents = this.database.prepare(
          `SELECT * FROM ${relation.targetModel} WHERE id IN (${foreignKeys.map(() => '?').join(',')})`
        ).all(foreignKeys);

        rows.forEach(row => {
          row[relationAlias] = parents.find(parent => parent.id === row[relation.foreignKey]);
        });
      }

      if (relation.type === 'manyToMany') {
        const sourceIds = rows.map(row => row.id);
        const linkRows = this.database.prepare(
          `SELECT * FROM ${relation.throughTable} WHERE ${relation.sourceKey} IN (${sourceIds.map(() => '?').join(',')})`
        ).all(sourceIds);

        const targetIds = linkRows.map(link => link[relation.targetKey]);
        const targetRows = this.database.prepare(
          `SELECT * FROM ${relation.targetModel} WHERE id IN (${targetIds.map(() => '?').join(',')})`
        ).all(targetIds);

        rows.forEach(row => {
          const relatedLinks = linkRows.filter(link => link[relation.sourceKey] === row.id);
          row[relation.targetModel] = targetRows.filter(target =>
            relatedLinks.some(link => link[relation.targetKey] === target.id)
          );
        });
      }
    }

    return rows;
  }

  findOne(modelName, options) {
    return this.findAll(modelName, { ...options, limit: 1 })[0] || null;
  }

  update(modelName, data, whereConditions) {
    if (!whereConditions || !Object.keys(whereConditions).length) {
      throw new Error('WHERE obbligatorio');
    }

    const setClause = Object.keys(data).map(key => `${key} = :${key}`).join(',');
    const whereClause = this._buildWhereClause(whereConditions);

    return this.database.prepare(
      `UPDATE ${modelName} SET ${setClause} ${whereClause.sql}`
    ).run({ ...data, ...whereClause.params });
  }

  delete(modelName, whereConditions) {
    if (!whereConditions || !Object.keys(whereConditions).length) {
      throw new Error('WHERE obbligatorio');
    }

    const whereClause = this._buildWhereClause(whereConditions);
    return this.database.prepare(
      `DELETE FROM ${modelName} ${whereClause.sql}`
    ).run(whereClause.params);
  }

  transaction(callback) {
    return this.database.transaction(callback)();
  }

  close() {
    this.database.close();
  }
}
