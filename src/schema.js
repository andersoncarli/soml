// Schema system inspired by CentralStation
const { soml } = require('./soml');

class Schema {
  constructor(definition) {
    this.name = definition.name;
    this.fields = definition.fields || {};
    this.views = definition.views || {};
    this.routes = definition.routes || {};
    this.events = definition.events || {};
  }

  // Generate CRUD operations
  getCRUD(db) {
    const collectionName = this.name.toLowerCase() + 's';
    
    return {
      create: async (data) => {
        this.validate(data);
        const conn = await db.connect();
        const result = await conn.collection(collectionName).insertOne(data);
        return { ...data, _id: result.insertedId };
      },
      
      read: async (id) => {
        const conn = await db.connect();
        return await conn.collection(collectionName).findOne({ id });
      },
      
      update: async (id, data) => {
        this.validate(data, true);
        const conn = await db.connect();
        const result = await conn.collection(collectionName).updateOne(
          { id },
          { $set: data }
        );
        return result;
      },
      
      delete: async (id) => {
        const conn = await db.connect();
        return await conn.collection(collectionName).deleteOne({ id });
      },
      
      list: async (query = {}, options = {}) => {
        const conn = await db.connect();
        return await conn.collection(collectionName).find(query, options).toArray();
      }
    };
  }

  // Validate data against field definitions
  validate(data, partial = false) {
    for (const [field, config] of Object.entries(this.fields)) {
      // Check required fields
      if (config.required && !partial && !(field in data)) {
        throw new Error(`Field '${field}' is required`);
      }
      
      // Apply defaults
      if (!(field in data) && config.default) {
        data[field] = typeof config.default === 'function' ? config.default() : config.default;
      }
      
      // Type conversion
      if (field in data && config.type) {
        if (config.type === 'date' && !(data[field] instanceof Date)) {
          data[field] = new Date(data[field]);
        }
      }
    }
    return data;
  }

  // Render a view
  render(viewName, data) {
    if (!this.views[viewName]) {
      throw new Error(`View '${viewName}' not found in schema '${this.name}'`);
    }
    return this.views[viewName](data);
  }

  // Generate Express routes
  getRoutes(db) {
    const routes = [];
    const crud = this.getCRUD(db);

    for (const [path, action] of Object.entries(this.routes)) {
      routes.push({
        path,
        action,
        handler: async (req, res) => {
          try {
            let data;
            switch (action) {
              case 'list':
                data = await crud.list();
                const listHtml = soml.toHtml(this.render('list', data));
                res.send('<!DOCTYPE html>' + listHtml);
                break;
                
              case 'detail':
                data = await crud.read(req.params.id);
                if (!data) {
                  res.status(404).send('Not found');
                  return;
                }
                const detailHtml = soml.toHtml(this.render('detail', data));
                res.send('<!DOCTYPE html>' + detailHtml);
                break;
                
              case 'form':
                data = req.params.id ? await crud.read(req.params.id) : {};
                const formHtml = soml.toHtml(this.render('form', data));
                res.send('<!DOCTYPE html>' + formHtml);
                break;
                
              default:
                res.status(400).send('Unknown action');
            }
          } catch (error) {
            console.error('Route error:', error);
            res.status(500).json({ error: error.message });
          }
        }
      });
    }

    return routes;
  }

  // Get API routes for CRUD operations
  getAPIRoutes(db) {
    const crud = this.getCRUD(db);
    const basePath = `/api/${this.name.toLowerCase()}s`;

    return [
      {
        method: 'get',
        path: basePath,
        handler: async (req, res) => {
          try {
            const data = await crud.list();
            res.json(data);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
      },
      {
        method: 'get',
        path: `${basePath}/:id`,
        handler: async (req, res) => {
          try {
            const data = await crud.read(req.params.id);
            if (!data) {
              res.status(404).json({ error: 'Not found' });
              return;
            }
            res.json(data);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
      },
      {
        method: 'post',
        path: basePath,
        handler: async (req, res) => {
          try {
            const data = await crud.create(req.body);
            res.status(201).json(data);
          } catch (error) {
            res.status(400).json({ error: error.message });
          }
        }
      },
      {
        method: 'put',
        path: `${basePath}/:id`,
        handler: async (req, res) => {
          try {
            await crud.update(req.params.id, req.body);
            const data = await crud.read(req.params.id);
            res.json(data);
          } catch (error) {
            res.status(400).json({ error: error.message });
          }
        }
      },
      {
        method: 'delete',
        path: `${basePath}/:id`,
        handler: async (req, res) => {
          try {
            await crud.delete(req.params.id);
            res.status(204).send();
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
      }
    ];
  }
}

// Helper to define schemas
const defineSchema = (definition) => new Schema(definition);

module.exports = { Schema, defineSchema };

