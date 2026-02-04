/**
 * SafeORM v4 - Production Ready
 * Lightweight ORM SINCRONO basato su better-sqlite3.
 * TUTTE le operazioni sono sincrone.
 */

/**
 * DataTypes
 */
const DataTypes = Object.freeze({
  STRING: 'STRING',
  TEXT: 'TEXT',
  INTEGER: 'INTEGER',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  EMAIL: 'EMAIL',
  AUTOINCREMENT: 'AUTOINCREMENT',
  DATETIME: 'DATETIME',
  DATE: 'DATE',
  TIME: 'TIME',
  JSONB: 'JSONB',
  BLOB: 'BLOB'
});

export const {
  STRING, TEXT, INTEGER, NUMBER, BOOLEAN,
  EMAIL, AUTOINCREMENT, DATETIME, DATE,
  TIME, JSONB, BLOB
} = DataTypes;

import Database from 'better-sqlite3';

// ==================================================
// SafeORM v4 – SINCRONO
// ==================================================

class ORMError extends Error {
  constructor(message, code = 'ORM_ERROR', originalError = null) {
    super(message);
    this.name = 'ORMError';
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends ORMError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class NotFoundError extends ORMError {
  constructor(model, id) {
    super(`${model} with id ${id} not found`, 'NOT_FOUND_ERROR');
    this.model = model;
    this.id = id;
  }
}

class ORMLogger {
  constructor(level = 'error') {
    this.levels = ['debug', 'info', 'warn', 'error', 'silent'];
    this.level = this.levels.includes(level) ? level : 'error';
  }

  log(level, message, meta = {}) {
    if (this.levels.indexOf(level) < this.levels.indexOf(this.level)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };

    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message, meta) { this.log('debug', message, meta); }
  info(message, meta) { this.log('info', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  error(message, meta) { this.log('error', message, meta); }
}

export default class SafeORM {
  constructor(databasePath, options = {}) {
    try {
      const dbOptions = {
        verbose: options.logLevel === 'debug' ? console.log : null,
        timeout: options.timeout || 5000,
        ...options.dbOptions
      };

      this.database = new Database(databasePath, dbOptions);

      this.database.pragma('journal_mode = WAL');
      this.database.pragma('synchronous = NORMAL');
      this.database.pragma('foreign_keys = ON');

      this.modelRegistry = {};
      this.statementCache = new Map();
      this.logger = new ORMLogger(options.logLevel || 'error');

      this._initializeMetaTable();

      this.logger.info('ORM initialized', { databasePath });
    } catch (error) {
      this.logger.error('Failed to initialize ORM', { error: error.message });
      throw new ORMError('Database initialization failed', 'INIT_ERROR', error);
    }
  }

  // ================= STATEMENT CACHE =================
  _getCachedStatement(sql) {
    if (this.statementCache.has(sql)) {
      return this.statementCache.get(sql);
    }

    try {
      const stmt = this.database.prepare(sql);
      this.statementCache.set(sql, stmt);
      return stmt;
    } catch (error) {
      this.logger.error('Failed to prepare statement', { sql, error: error.message });
      throw new ORMError('Statement preparation failed', 'SQL_ERROR', error);
    }
  }

  // ================= META / MIGRATIONS =================
  _initializeMetaTable() {
    this.database.prepare(`
      CREATE TABLE IF NOT EXISTS _meta (
        version INTEGER,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        migration_history TEXT DEFAULT '[]'
      )
    `).run();

    const meta = this.database.prepare(`SELECT version FROM _meta`).get();
    if (!meta) {
      this.database.prepare(`INSERT INTO _meta (version) VALUES (0)`).run();
    }
  }

  getDatabaseVersion() {
    return this.database.prepare(`SELECT version FROM _meta`).get().version;
  }

  migrateTo(targetVersion, migrations) {
    let currentVersion = this.getDatabaseVersion();

    if (currentVersion > targetVersion) {
      throw new ORMError(`Cannot downgrade from version ${currentVersion} to ${targetVersion}`, 'MIGRATION_ERROR');
    }

    while (currentVersion < targetVersion) {
      const nextVersion = currentVersion + 1;
      const migration = migrations[nextVersion];

      if (!migration) {
        throw new ORMError(`Migration for version ${nextVersion} not found`, 'MIGRATION_ERROR');
      }

      this.logger.info(`Applying migration to version ${nextVersion}`);

      this.database.transaction(() => {
        migration(this.database);

        const history = this.database
          .prepare(`SELECT migration_history FROM _meta`)
          .get().migration_history || '[]';
        const parsedHistory = JSON.parse(history);
        parsedHistory.push({
          version: nextVersion,
          timestamp: new Date().toISOString(),
          description: migration.description || 'No description'
        });

        this.database
          .prepare(`UPDATE _meta SET version=?, migration_history=?`)
          .run(nextVersion, JSON.stringify(parsedHistory));
      })();

      currentVersion = nextVersion;
      this.logger.info(`Migration to version ${nextVersion} completed`);
    }
  }

  // ================= HELPER FUNCTIONS =================
  _convertForSQLite(value, type) {
    if (value === undefined || value === null) {
      return null;
    }

    switch (type) {
      case 'BOOLEAN':
        // Gestisci stringhe 'true'/'false' e booleani
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' ? 1 : 0;
        }
        return value ? 1 : 0;
      case 'JSONB':
        if (typeof value === 'string') {
          try {
            // Valida che sia JSON valido
            JSON.parse(value);
            return value;
          } catch {
            // Se non è JSON valido, lascia come stringa
            return value;
          }
        } else if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        // Per altri tipi, converti in stringa
        return String(value);
      case 'INTEGER':
        const intVal = parseInt(value, 10);
        return isNaN(intVal) ? null : intVal;
      case 'NUMBER':
        const floatVal = parseFloat(value);
        return isNaN(floatVal) ? null : floatVal;
      case 'DATETIME':
      case 'DATE':
      case 'TIME':
        // Per date, assicurati che sia una stringa
        return String(value);
      default:
        return value;
    }
  }

  _convertFromSQLite(value, type) {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'BOOLEAN':
        // SQLite memorizza booleani come 0/1
        return Boolean(value);
      case 'JSONB':
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            return JSON.parse(value);
          } catch {
            // Se non è JSON valido, restituisci la stringa
            return value;
          }
        }
        return value;
      case 'INTEGER':
        return parseInt(value, 10);
      case 'NUMBER':
        return parseFloat(value);
      default:
        return value;
    }
  }

  // ================= MODEL VALIDATION =================
  _validateData(modelName, data, isUpdate = false) {
    const schema = this.modelRegistry[modelName]?.schema;
    if (!schema) {
      throw new ORMError(`Model ${modelName} not defined`, 'MODEL_NOT_FOUND');
    }

    const errors = [];
    const validatedData = {};

    for (const [field, fieldDef] of Object.entries(schema)) {
      const value = data[field];

      // Skip validation for missing fields in update if not required
      if (isUpdate && value === undefined && !fieldDef.required) {
        continue;
      }

      // Required validation - solo se non è update o il campo è presente
      if (fieldDef.required && !isUpdate && (value === undefined || value === null || value === '')) {
        errors.push(new ValidationError(`Field ${field} is required`, field));
        continue;
      }

      // Se il valore è undefined/null in update, skip
      if (isUpdate && (value === undefined || value === null)) {
        continue;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        let convertedValue;

        switch (fieldDef.type) {
          case 'EMAIL':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(new ValidationError(`Field ${field} must be a valid email`, field));
            } else {
              convertedValue = value;
            }
            break;
          case 'INTEGER':
            const intVal = parseInt(value, 10);
            if (isNaN(intVal)) {
              errors.push(new ValidationError(`Field ${field} must be an integer`, field));
            } else {
              convertedValue = intVal;
            }
            break;
          case 'NUMBER':
            const floatVal = parseFloat(value);
            if (isNaN(floatVal)) {
              errors.push(new ValidationError(`Field ${field} must be a number`, field));
            } else {
              convertedValue = floatVal;
            }
            break;
          case 'BOOLEAN':
            // Accetta booleani, numeri 0/1, stringhe 'true'/'false'
            if (typeof value === 'boolean' || value === 0 || value === 1 ||
              value === '0' || value === '1' ||
              value === 'true' || value === 'false') {
              convertedValue = this._convertForSQLite(value, 'BOOLEAN');
            } else {
              errors.push(new ValidationError(`Field ${field} must be a boolean`, field));
            }
            break;
          case 'JSONB':
            try {
              convertedValue = this._convertForSQLite(value, 'JSONB');
            } catch (err) {
              errors.push(new ValidationError(`Field ${field} must be valid JSON`, field));
            }
            break;
          default:
            convertedValue = value;
        }

        if (convertedValue !== undefined) {
          // Length validation per stringhe
          if (fieldDef.maxLength && String(convertedValue).length > fieldDef.maxLength) {
            errors.push(new ValidationError(`Field ${field} exceeds max length of ${fieldDef.maxLength}`, field));
          }

          if (fieldDef.minLength && String(convertedValue).length < fieldDef.minLength) {
            errors.push(new ValidationError(`Field ${field} must be at least ${fieldDef.minLength} characters`, field));
          }

          // Range validation per numeri
          if ((fieldDef.type === 'INTEGER' || fieldDef.type === 'NUMBER') && convertedValue !== null) {
            const numValue = Number(convertedValue);
            if (fieldDef.min !== undefined && numValue < fieldDef.min) {
              errors.push(new ValidationError(`Field ${field} must be at least ${fieldDef.min}`, field));
            }
            if (fieldDef.max !== undefined && numValue > fieldDef.max) {
              errors.push(new ValidationError(`Field ${field} must be at most ${fieldDef.max}`, field));
            }
          }

          validatedData[field] = convertedValue;
        }
      } else if (fieldDef.default !== undefined && !isUpdate) {
        // Applica default solo per creazione, non per update
        const defaultValue = typeof fieldDef.default === 'function'
          ? fieldDef.default()
          : fieldDef.default;

        validatedData[field] = this._convertForSQLite(defaultValue, fieldDef.type);
      }
    }

    if (errors.length > 0) {
      throw new ORMError('Validation failed', 'VALIDATION_ERROR', { errors });
    }

    return validatedData;
  }

  // ================= MODEL DEFINITION =================
  define(modelName, schemaDefinition, options = {}) {
    try {
      if (this.modelRegistry[modelName]) {
        this.logger.warn(`Model ${modelName} already defined, overwriting`);
      }

      this.modelRegistry[modelName] = {
        schema: schemaDefinition,
        hooks: options.hooks || {},
        relations: {},
        indexes: options.indexes || [],
        timestamps: options.timestamps !== false,
        paranoid: options.paranoid || false
      };

      const columnDefinitions = Object.entries(schemaDefinition).map(([columnName, columnDef]) => {
        let sqlType = 'TEXT';
        const mapping = {
          'INTEGER': 'INTEGER',
          'BOOLEAN': 'INTEGER',
          'NUMBER': 'REAL',
          'DATETIME': 'DATETIME',
          'DATE': 'DATE',
          'TIME': 'TIME',
          'JSONB': 'TEXT',
          'BLOB': 'BLOB',
          'AUTOINCREMENT': 'INTEGER PRIMARY KEY AUTOINCREMENT'
        };

        if (mapping[columnDef.type]) {
          sqlType = mapping[columnDef.type];
        }

        let columnSql = `${columnName} ${sqlType}`;
        if (columnDef.required) columnSql += ' NOT NULL';
        if (columnDef.unique) columnSql += ' UNIQUE';

        if (columnDef.default !== undefined) {
          const defaultValue = typeof columnDef.default === 'function'
            ? columnDef.default()
            : columnDef.default;

          const sqlDefault = this._convertForSQLite(defaultValue, columnDef.type);

          if (typeof sqlDefault === 'string') {
            columnSql += ` DEFAULT '${sqlDefault.replace(/'/g, "''")}'`;
          } else if (sqlDefault === null) {
            columnSql += ' DEFAULT NULL';
          } else {
            columnSql += ` DEFAULT ${sqlDefault}`;
          }
        }

        if (columnDef.references) {
          columnSql += ` REFERENCES ${columnDef.references.table}(${columnDef.references.column})`;
          if (columnDef.references.onDelete) {
            columnSql += ` ON DELETE ${columnDef.references.onDelete}`;
          }
          if (columnDef.references.onUpdate) {
            columnSql += ` ON UPDATE ${columnDef.references.onUpdate}`;
          }
        }

        return columnSql;
      }).join(',');

      let finalColumns = columnDefinitions;
      if (this.modelRegistry[modelName].timestamps) {
        finalColumns += columnDefinitions ? ',' : '';
        finalColumns += 'created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP';
      }

      if (this.modelRegistry[modelName].paranoid) {
        finalColumns += ',deleted_at DATETIME';
      }

      const sql = `CREATE TABLE IF NOT EXISTS ${modelName} (${finalColumns})`;
      this.database.prepare(sql).run();

      this.modelRegistry[modelName].indexes.forEach(index => {
        const indexName = `idx_${modelName}_${index.columns.join('_')}`;
        const sql = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${modelName} (${index.columns.join(',')})`;
        this.database.prepare(sql).run();
      });

      this.logger.info(`Model ${modelName} defined`);
    } catch (error) {
      this.logger.error(`Failed to define model ${modelName}`, { error: error.message });
      throw new ORMError(`Model definition failed for ${modelName}`, 'MODEL_DEFINITION_ERROR', error);
    }
  }

  // ================= RELATIONS =================
  hasMany(sourceModel, targetModel, { as, foreignKey, cascade = false }) {
    this._validateModel(sourceModel);
    this._validateModel(targetModel);

    this.modelRegistry[sourceModel].relations[as] = {
      type: 'hasMany',
      targetModel,
      foreignKey,
      cascade
    };
  }

  belongsTo(sourceModel, targetModel, { as, foreignKey }) {
    this._validateModel(sourceModel);
    this._validateModel(targetModel);

    this.modelRegistry[sourceModel].relations[as] = {
      type: 'belongsTo',
      targetModel,
      foreignKey
    };
  }

  manyToMany(modelA, modelB, { through, aKey, bKey }) {
    this._validateModel(modelA);
    this._validateModel(modelB);

    this.define(through, {
      id: { type: 'AUTOINCREMENT' },
      [aKey]: {
        type: 'INTEGER',
        required: true,
        references: { table: modelA, column: 'id', onDelete: 'CASCADE' }
      },
      [bKey]: {
        type: 'INTEGER',
        required: true,
        references: { table: modelB, column: 'id', onDelete: 'CASCADE' }
      }
    }, {
      indexes: [{ columns: [aKey, bKey], unique: true }]
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

  _validateModel(modelName) {
    if (!this.modelRegistry[modelName]) {
      throw new ORMError(`Model ${modelName} not found`, 'MODEL_NOT_FOUND');
    }
  }

  // ================= MODEL INSTANCE API =================
  model(modelName) {
    this._validateModel(modelName);

    return {
      create: (data) => this.create(modelName, data),
      bulkCreate: (dataArray) => this.bulkCreate(modelName, dataArray),
      findAll: (options) => this.findAll(modelName, options),
      findOne: (options) => this.findOne(modelName, options),
      findByPk: (id) => this.findByPk(modelName, id),
      update: (data, where) => this.update(modelName, data, where),
      delete: (where) => this.delete(modelName, where),
      count: (where) => this.count(modelName, where),
      exists: (where) => this.exists(modelName, where),
      raw: (sql, params) => this.rawQuery(sql, params)
    };
  }

  // ================= CORE OPERATIONS =================
  _buildWhereClause(whereConditions = {}, modelName = null) {
    const sqlFragments = [];
    const parameters = {};
    let paramIndex = 0;

    // Helper per convertire valori per SQLite
    const convertValueForSQLite = (value, field) => {
      if (value === null || value === undefined) {
        return null;
      }
      
      // Controlla se è un booleano
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      
      // Controlla se è un oggetto (ma non array, null, o Date)
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Probabilmente è un oggetto JSON, converti in stringa
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      
      // Per array, meglio non convertire qui
      return value;
    };

    for (const field in whereConditions) {
      const condition = whereConditions[field];
      
      if (condition === null || condition === undefined) {
        sqlFragments.push(`${field} IS NULL`);
        continue;
      }

      if (typeof condition === 'object' && !Array.isArray(condition) && condition !== null) {
        const operators = {
          $gt: '>', $gte: '>=', $lt: '<', $lte: '<=',
          $ne: '!=', $in: 'IN', $nin: 'NOT IN',
          $like: 'LIKE', $ilike: 'LIKE',
          $between: 'BETWEEN', $notBetween: 'NOT BETWEEN'
        };

        for (const op in condition) {
          if (operators[op]) {
            const paramName = `p${paramIndex++}`;
            let paramValue = condition[op];
            
            switch (op) {
              case '$in':
              case '$nin':
                const values = Array.isArray(paramValue) ? paramValue : [paramValue];
                // Crea parametri separati per ogni valore
                const inParams = {};
                const placeholders = [];
                
                values.forEach((val, idx) => {
                  const singleParamName = `${paramName}_${idx}`;
                  placeholders.push(`:${singleParamName}`);
                  
                  // Converti il valore per SQLite
                  inParams[singleParamName] = convertValueForSQLite(val, field);
                });
                
                sqlFragments.push(`${field} ${operators[op]} (${placeholders.join(',')})`);
                Object.assign(parameters, inParams);
                break;
              
              case '$between':
              case '$notBetween':
                const [start, end] = paramValue;
                sqlFragments.push(`${field} ${operators[op]} :${paramName}_start AND :${paramName}_end`);
                parameters[`${paramName}_start`] = convertValueForSQLite(start, field);
                parameters[`${paramName}_end`] = convertValueForSQLite(end, field);
                break;
              
              default:
                sqlFragments.push(`${field} ${operators[op]} :${paramName}`);
                parameters[paramName] = convertValueForSQLite(paramValue, field);
            }
          } else if (op === '$or' || op === '$and') {
            const nested = condition[op].map(nestedCond => {
              const nestedResult = this._buildWhereClause(nestedCond, modelName);
              Object.assign(parameters, nestedResult.params);
              return `(${nestedResult.sql.replace('WHERE ', '')})`;
            });
            sqlFragments.push(`(${nested.join(` ${op.replace('$', '').toUpperCase()} `)})`);
          }
        }
      } else {
        const paramName = `p${paramIndex++}`;
        sqlFragments.push(`${field} = :${paramName}`);
        parameters[paramName] = convertValueForSQLite(condition, field);
      }
    }

    if (modelName && this.modelRegistry[modelName]?.paranoid) {
      sqlFragments.push('deleted_at IS NULL');
    }

    return {
      sql: sqlFragments.length ? 'WHERE ' + sqlFragments.join(' AND ') : '',
      params: parameters
    };
  }

  // ================= METODI SINCRONI =================

  create(modelName, data) {
    this._validateModel(modelName);

    const validatedData = this._validateData(modelName, data, false);

    const hooks = this.modelRegistry[modelName].hooks;
    hooks.beforeCreate?.(validatedData);

    const columns = Object.keys(validatedData);
    const placeholders = columns.map(c => ':' + c).join(',');
    const sql = `INSERT INTO ${modelName} (${columns.join(',')}) VALUES (${placeholders})`;

    this.logger.debug('CREATE operation', { modelName, sql });

    try {
      const stmt = this._getCachedStatement(sql);

      // DEBUG: Log dei dati che stiamo passando
      console.log('DEBUG - Dati validati:', validatedData);

      const result = stmt.run(validatedData);

      hooks.afterCreate?.(result, validatedData);

      return {
        ...result,
        id: result.lastInsertRowid,
        data: validatedData
      };
    } catch (error) {
      this.logger.error('CREATE operation failed', { modelName, error: error.message });

      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ORMError('Constraint violation', 'CONSTRAINT_ERROR', error);
      }

      throw new ORMError('Create operation failed', 'CREATE_ERROR', error);
    }
  }

  bulkCreate(modelName, dataArray) {
    return this.transaction(() => {
      return dataArray.map(data => this.create(modelName, data));
    });
  }

  findAll(modelName, options = {}) {
    this._validateModel(modelName);

    const {
      where = {},
      include = [],
      limit,
      offset,
      orderBy,
      attributes,
      distinct = false
    } = options;

    const whereClause = this._buildWhereClause(where, modelName);

    const selectClause = attributes
      ? attributes.join(',')
      : '*';

    let sql = `SELECT ${distinct ? 'DISTINCT' : ''} ${selectClause} FROM ${modelName} ${whereClause.sql}`;

    if (orderBy) {
      const orderClause = Array.isArray(orderBy)
        ? orderBy.map(o => `${o.field} ${o.direction || 'ASC'}`).join(', ')
        : `${orderBy} ASC`;
      sql += ` ORDER BY ${orderClause}`;
    }

    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        sql += ` OFFSET ${offset}`;
      }
    }

    this.logger.debug('FINDALL operation', { modelName, sql });

    const stmt = this._getCachedStatement(sql);
    const rows = stmt.all(whereClause.params);

    // Parsa i campi secondo lo schema
    const schema = this.modelRegistry[modelName].schema;
    const parsedRows = rows.map(row => {
      const parsedRow = {};
      for (const key in row) {
        const fieldDef = schema[key];
        if (fieldDef) {
          parsedRow[key] = this._convertFromSQLite(row[key], fieldDef.type);
        } else {
          // Campi speciali come created_at, updated_at
          parsedRow[key] = row[key];
        }
      }
      return parsedRow;
    });

    if (include.length > 0) {
      this._applyIncludes(modelName, parsedRows, include);
    }

    const hooks = this.modelRegistry[modelName].hooks;
    if (hooks.afterFind) {
      return Array.isArray(parsedRows)
        ? parsedRows.map(row => hooks.afterFind(row))
        : hooks.afterFind(parsedRows);
    }

    return parsedRows;
  }

  _applyIncludes(modelName, rows, includes) {
    const model = this.modelRegistry[modelName];

    for (const include of includes) {
      let relationAlias, includeOptions;

      if (typeof include === 'string') {
        relationAlias = include;
        includeOptions = {};
      } else {
        relationAlias = include.model || include.as;
        includeOptions = include;
      }

      const relation = model.relations[relationAlias];
      if (!relation) continue;

      switch (relation.type) {
        case 'hasMany':
          this._loadHasMany(rows, relation, includeOptions);
          break;
        case 'belongsTo':
          this._loadBelongsTo(rows, relation, includeOptions);
          break;
        case 'manyToMany':
          this._loadManyToMany(rows, relation, includeOptions);
          break;
      }
    }

    return rows;
  }

  _loadHasMany(parentRows, relation, options) {
    const parentIds = parentRows.map(row => row.id);
    if (parentIds.length === 0) {
      parentRows.forEach(row => row[relation.as] = []);
      return;
    }

    const where = { [relation.foreignKey]: { $in: parentIds } };
    if (options.where) {
      Object.assign(where, options.where);
    }

    const children = this.findAll(relation.targetModel, {
      where,
      limit: options.limit,
      orderBy: options.orderBy,
      attributes: options.attributes
    });

    const childrenByParentId = {};
    children.forEach(child => {
      const parentId = child[relation.foreignKey];
      if (!childrenByParentId[parentId]) {
        childrenByParentId[parentId] = [];
      }
      childrenByParentId[parentId].push(child);
    });

    parentRows.forEach(row => {
      row[relation.as] = childrenByParentId[row.id] || [];
    });
  }

  _loadBelongsTo(parentRows, relation, options) {
    const foreignKeys = [...new Set(parentRows.map(row => row[relation.foreignKey]))];

    if (foreignKeys.length === 0) {
      parentRows.forEach(row => row[relation.as] = null);
      return;
    }

    const where = { id: { $in: foreignKeys } };
    const parents = this.findAll(relation.targetModel, {
      where,
      attributes: options.attributes
    });

    const parentById = {};
    parents.forEach(parent => {
      parentById[parent.id] = parent;
    });

    parentRows.forEach(row => {
      row[relation.as] = parentById[row[relation.foreignKey]] || null;
    });
  }

  _loadManyToMany(parentRows, relation, options) {
    const sourceIds = parentRows.map(row => row.id);

    if (sourceIds.length === 0) {
      parentRows.forEach(row => row[relation.targetModel] = []);
      return;
    }

    const linkRows = this.findAll(relation.throughTable, {
      where: { [relation.sourceKey]: { $in: sourceIds } }
    });

    const targetIds = [...new Set(linkRows.map(link => link[relation.targetKey]))];

    if (targetIds.length === 0) {
      parentRows.forEach(row => row[relation.targetModel] = []);
      return;
    }

    const targetWhere = { id: { $in: targetIds } };
    if (options.where) {
      Object.assign(targetWhere, options.where);
    }

    const targetRows = this.findAll(relation.targetModel, {
      where: targetWhere,
      limit: options.limit,
      orderBy: options.orderBy,
      attributes: options.attributes
    });

    const targetById = {};
    targetRows.forEach(target => {
      targetById[target.id] = target;
    });

    const linksBySourceId = {};
    linkRows.forEach(link => {
      const sourceId = link[relation.sourceKey];
      if (!linksBySourceId[sourceId]) {
        linksBySourceId[sourceId] = [];
      }
      linksBySourceId[sourceId].push(link);
    });

    parentRows.forEach(row => {
      const links = linksBySourceId[row.id] || [];
      row[relation.targetModel] = links
        .map(link => targetById[link[relation.targetKey]])
        .filter(Boolean);
    });
  }

  findOne(modelName, options = {}) {
    const rows = this.findAll(modelName, { ...options, limit: 1 });
    return rows[0] || null;
  }

  findByPk(modelName, id, options = {}) {
    return this.findOne(modelName, {
      where: { id },
      ...options
    });
  }

  update(modelName, data, whereConditions) {
    this._validateModel(modelName);

    if (!whereConditions || !Object.keys(whereConditions).length) {
      throw new ValidationError('WHERE conditions are required for update');
    }

    console.log('DEBUG - Dati prima della validazione (update):', data);

    const validatedData = this._validateData(modelName, data, true);

    console.log('DEBUG - Dati validati (update):', validatedData);

    if (this.modelRegistry[modelName]?.timestamps) {
      validatedData.updated_at = new Date().toISOString();
    }

    const hooks = this.modelRegistry[modelName].hooks;
    hooks.beforeUpdate?.(validatedData, whereConditions);

    const setClause = Object.keys(validatedData)
      .map(key => `${key} = :${key}`)
      .join(',');

    const whereClause = this._buildWhereClause(whereConditions, modelName);

    const sql = `UPDATE ${modelName} SET ${setClause} ${whereClause.sql}`;

    this.logger.debug('UPDATE operation', { modelName, sql });

    try {
      const stmt = this._getCachedStatement(sql);
      const params = { ...validatedData, ...whereClause.params };

      console.log('DEBUG - Parametri finali per UPDATE:', params);

      const result = stmt.run(params);

      hooks.afterUpdate?.(result, validatedData, whereConditions);

      return {
        ...result,
        affectedRows: result.changes,
        data: validatedData
      };
    } catch (error) {
      this.logger.error('UPDATE operation failed', { modelName, error: error.message });
      throw new ORMError('Update operation failed', 'UPDATE_ERROR', error);
    }
  }

  delete(modelName, whereConditions, force = false) {
    this._validateModel(modelName);

    if (!whereConditions || !Object.keys(whereConditions).length) {
      throw new ValidationError('WHERE conditions are required for delete');
    }

    const hooks = this.modelRegistry[modelName].hooks;
    hooks.beforeDelete?.(whereConditions);

    let sql;
    let params;

    if (this.modelRegistry[modelName]?.paranoid && !force) {
      const whereClause = this._buildWhereClause(whereConditions, modelName);
      sql = `UPDATE ${modelName} SET deleted_at = :deleted_at ${whereClause.sql}`;
      params = { ...whereClause.params, deleted_at: new Date().toISOString() };
    } else {
      const whereClause = this._buildWhereClause(whereConditions);
      sql = `DELETE FROM ${modelName} ${whereClause.sql}`;
      params = whereClause.params;
    }

    this.logger.debug('DELETE operation', { modelName, sql, force });

    const stmt = this._getCachedStatement(sql);
    const result = stmt.run(params);

    hooks.afterDelete?.(result, whereConditions);

    return {
      ...result,
      affectedRows: result.changes
    };
  }

  count(modelName, whereConditions = {}) {
    this._validateModel(modelName);

    const whereClause = this._buildWhereClause(whereConditions, modelName);
    const sql = `SELECT COUNT(*) as count FROM ${modelName} ${whereClause.sql}`;

    const stmt = this._getCachedStatement(sql);
    const result = stmt.get(whereClause.params);

    return result.count;
  }

  exists(modelName, whereConditions) {
    return this.count(modelName, whereConditions) > 0;
  }

  rawQuery(sql, params = {}) {
    try {
      const stmt = this._getCachedStatement(sql);
      return stmt.all(params);
    } catch (error) {
      this.logger.error('Raw query failed', { sql, error: error.message });
      throw new ORMError('Raw query failed', 'RAW_QUERY_ERROR', error);
    }
  }

  // ================= TRANSACTIONS =================
  transaction(callback) {
    this.logger.debug('Starting transaction');

    try {
      const result = this.database.transaction(callback)();
      this.logger.debug('Transaction completed');
      return result;
    } catch (error) {
      this.logger.error('Transaction failed', { error: error.message });
      throw error;
    }
  }

  // ================= UTILITIES =================
  backup(destinationPath) {
    try {
      const backupDB = new Database(destinationPath);
      this.database.backup(backupDB);
      backupDB.close();
      this.logger.info('Database backup created', { destinationPath });
      return true;
    } catch (error) {
      this.logger.error('Backup failed', { error: error.message });
      throw new ORMError('Backup failed', 'BACKUP_ERROR', error);
    }
  }

  vacuum() {
    try {
      this.database.prepare('VACUUM').run();
      this.logger.info('Database vacuum completed');
      return true;
    } catch (error) {
      this.logger.error('Vacuum failed', { error: error.message });
      throw new ORMError('Vacuum failed', 'VACUUM_ERROR', error);
    }
  }

  getStats() {
    const models = Object.keys(this.modelRegistry);
    const stats = {};

    for (const model of models) {
      const count = this.count(model, {});
      stats[model] = { count };
    }

    return {
      models: models.length,
      stats,
      statementCacheSize: this.statementCache.size,
      databaseSize: this.database.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get().size
    };
  }

  clearCache() {
    this.statementCache.clear();
    this.logger.info('Statement cache cleared');
  }

  close() {
    try {
      this.clearCache();
      this.database.close();
      this.logger.info('ORM closed');
    } catch (error) {
      this.logger.error('Failed to close ORM', { error: error.message });
      throw new ORMError('Failed to close ORM', 'CLOSE_ERROR', error);
    }
  }
}