const debug = require('debug')('universal-pattern:services');

const services = (Application) => {
  const { db, getModule } = Application;
  debug('services constructor called');
  if (!db) {
    const methods = [
      'search',
      'today',
      'insert',
      'findOne',
      'insertOrCount',
      'remove',
      'removeAll',
      'update',
      'updateByFilter',
      'count',
      'find',
      'getLast',
      'modify',
      'aggregate',
      'distinct',
    ].reduce((acc, actual) => {
      acc[actual] = () => {
        throw new Error('DB no setted');
      };
      return acc;
    }, {});
    return methods;
  }

  return {
    search: async (endpoint, query, pages = {}, fields = {}, opts = {}) => {
      const collection = getModule(endpoint);
      debug('.search called', collection, query, pages, fields);
      return new Promise((resolve, reject) => {
        const p = {
          limit: pages.limit || 50,
          page: pages.page || 1,
          sort: pages.sorting,
        };
        if (typeof db[collection].paginate === 'undefined') {
          return resolve({
            docs: [],
            limit: 1,
            count: 0,
            page: 1,
            totalPages: 0,
            error: true,
            msg: 'paginate method not found',
          });
        }
        return db[collection].paginate(pages.q || {}, fields, p, opts)
          .then(resolve)
          .catch(reject);
      });
    },
    today: async (endpoint) => {
      debug('.today called: ');

      return new Promise((resolve, reject) => {
        const collection = getModule(endpoint.replace('/today', ''));
        const p = {
          limit: 500,
          page: 1,
          sorting: '_id:desc',
        };

        const today = new Date();
        today.setHours(0, 0, 0);
        const tomorow = new Date(this.moment(today).add(1, 'days'));

        db[collection].paginate({ $and: [{ added: { $gte: today } }, { added: { $lte: tomorow } }] }, {}, p)
          .then(resolve)
          .catch(reject);
      });// end promise
    },

    insert: async (endpoint, data, opts = {}) => {
      const collection = getModule(endpoint);
      data.added = new Date();
      debug(`.insert called: ${JSON.stringify(data)}`);
      const inserted = await db[collection].asyncInsert(data, opts);
      return inserted;
    },

    findOne: async (endpoint, query = {}, props = {}, opts = {}) => {
      debug('findOne called: ', endpoint, query, props);
      const collection = getModule(endpoint);
      if (query._id) query._id = db.ObjectId(query._id);
      const result = await db[collection].asyncFindOne(query, props, opts);
      return result;
    },

    insertOrCount: async (endpoint, params, opts = {}) => {
      const collection = getModule(endpoint);
      params.count = 1;

      const q = {};
      q[params._criterial] = params[params._criterial];
      delete params._criterial;
      const document = await db[collection].asyncFindOne(q, {}, opts);

      if (!document) {
        const inserted = await db[collection].asyncInsert(params, opts);
        return inserted;
      }
      await db[collection].asyncUpdate({ _id: db.ObjectId(String(document._id)) }, { $inc: { count: 1 } }, opts);
      const finalDocument = await db[collection].asyncFindOne({ _id: db.ObjectId(String(document._id)) }, {}, opts);
      return finalDocument;
    },
    remove: async (endpoint, _id, opts = {}) => {
      const collection = getModule(endpoint);
      const removed = await db[collection].asyncRemove({ _id: db.ObjectId(_id) }, opts);
      return removed;
    },

    removeAll: async (endpoint, query = { a: 1 }, opts = {}) => {
      const collection = getModule(endpoint);
      return db[collection].asyncRemove(query, opts);
    },
    update: async (endpoint, _id, data = {}, options = { updated: true, set: true }, opts = {}) => {
      const collection = getModule(endpoint);
      let query = {};
      if (options.updated) data.updated = new Date();
      if (options.set) query = { $set: data };
      else query = data;
      debug('.update called:', endpoint, _id, data, options, opts);
      const updated = await db[collection].asyncUpdate({ _id: db.ObjectId(_id) }, query, opts);
      return updated;
    },

    updateByFilter: async (endpoint, query = {}, data, options = { updated: true, set: true }, opts = {}) => {
      debug('updateByFilter called: ', endpoint, query, data, options, opts);
      let rData = data;
      const collection = getModule(endpoint);
      if (options.updated) data.updated = new Date();
      if (options.set) rData = { $set: data };

      const updated = await db[collection].asyncUpdate(query, rData, { ...opts, multi: true });
      return updated;
    },

    count: async (endpoint, query, opts = {}) => {
      debug('count called');
      const collection = getModule(endpoint);
      const total = await db[collection].asyncCount(query, opts);
      return total;
    },

    getLast: async (endpoint, query = {}, fields = {}) => {
      const collection = getModule(endpoint);
      debug('.getLast: ', collection, query, fields);
      return new Promise((resolve, reject) => {
        db[collection].find(query, fields)
          .sort({ _id: 1 }, (err, doc) => {
            if (err) return reject(err);
            return resolve(doc.length > 0 ? doc.pop() : null);
          });
      });
    },

    find: async (endpoint, query = {}, fields = {}, opts = {}) => {
      const collection = getModule(endpoint);
      debug('.find called: ', collection, query);
      const data = await db[collection].asyncFind(query, fields, opts);
      return data;
    },

    distinct: async (endpoint, field = '_id', query = {}) => {
      const collection = getModule(endpoint);
      debug('.distinct called: ', collection, field, query);
      return new Promise((resolve, reject) => {
        db[collection].distinct(field, query, (err, docs) => {
          if (err) return reject(err);
          return resolve(docs);
        });
      });
    },
    modify: async (collection, _id, query) => {
      debug('.modify called:', query);
      return new Promise((resolve, reject) => {
        db[collection].update({ _id: db.ObjectId(_id) }, query, (err, doc) => (err ? reject(err) : resolve(doc)));
      });
    },
    aggregate: async (endpoint, pipelines, options = undefined) => {
      const collection = getModule(endpoint);
      debug('aggregate called: ', collection, pipelines);
      return new Promise((resolve, reject) => {
        db[collection].aggregate(pipelines, options, (err, docs) => {
          if (err) return reject(err);
          return resolve(docs);
        });
      });
    },
  };
};

module.exports = services;
