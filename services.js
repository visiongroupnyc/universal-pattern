const debug = require('debug')('universal-pattern:services');

const services = (Application) => {
  const { db, getModule } = Application;
  debug('services constructor called');
  return {
    search: async (endpoint, query, pages = {}, fields = {}) => {
      const collection = getModule(endpoint);
      debug(`.search called ${collection}`);
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
        return db[collection].paginate(pages.q || {}, fields, p)
          .then(docs => resolve(docs))
          .catch(err => reject(err));
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
          .then(docs => resolve(docs))
          .catch(err => reject(err));
      });// end promise
    },

    insert: async (endpoint, params) => {
      const collection = getModule(endpoint);
      params.added = new Date();
      debug(`.insert called: ${JSON.stringify(params)}`);

      return new Promise((resolve, reject) => {
        db[collection].insert(params, (err, doc) => (err ? reject(err) : resolve(doc)));
      });
    },

    findOne: async (endpoint, query = {}, props = {}) => {
      debug('findOne called: ', endpoint, query, props);
      const collection = getModule(endpoint);
      if (query._id) query._id = db.ObjectId(query._id);
      return new Promise((resolve, reject) => {
        db[collection].findOne(query, props, (err, doc) => (err ? reject(err) : resolve(doc)));
      });
    },

    insertOrCount: async (endpoint, params) => {
      const collection = getModule(endpoint);
      params.count = 1;

      return new Promise((resolve, reject) => {
        const q = {};
        q[params._criterial] = params._unique;
        delete params._criterial;
        delete params._unique;

        db[collection].findOne(q, {}, (err, doc) => {
          if (err) return reject(err);
          if (doc === null) {
            return this.insert(endpoint, params)
              .then(data => resolve(data))
              .catch(err2 => reject(err2));
          }
          return this.update(endpoint, doc._id, Object.assign({}, params, { count: doc.count + 1 }))
            .then(data => resolve(data))
            .catch(err3 => reject(err3));
        });
      });
    },
    remove: async (endpoint, _id) => {
      const collection = getModule(endpoint);
      return new Promise((resolve, reject) => {
        db[collection].remove({ _id: db.ObjectId(_id) }, (err, doc) => (err ? reject(err) : resolve(doc)));
      });
    },

    removeAll: async (endpoint, query = { a: 1 }) => {
      const collection = getModule(endpoint);
      return new Promise((resolve, reject) => {
        db[collection].remove(query, (err, doc) => (err ? reject(err) : resolve(doc)));
      });
    },
    update: async (endpoint, _id, data = {}, opts = { updated: true, set: true }) => {
      const collection = getModule(endpoint);
      return new Promise((resolve, reject) => {
        let query = {};
        if (opts.updated) data.updated = new Date();
        if (opts.set) query = { $set: data };
        else query = data;
        debug('.update called:', endpoint, _id, data);
        db[collection].update({
          _id: db.ObjectId(_id),
        }, query, (err, doc) => {
          if (err) return reject(err);
          return resolve(doc);
        });
      });
    },

    updateByFilter: async (endpoint, query = {}, data, opts = { updated: true, set: true }) => {
      debug('updateByFilter called: ', endpoint, query, data, opts);
      return new Promise((resolve, reject) => {
        let rData = data;
        const collection = getModule(endpoint);
        if (opts.updated) data.updated = new Date();
        if (opts.set) rData = { $set: data };

        db[collection].update(query, rData, (err, doc) => {
          if (err) return reject(err);
          return resolve(doc);
        });
      });
    },

    count: async (endpoint, query) => {
      debug('count called');
      const collection = getModule(endpoint);
      return new Promise((resolve, reject) => {
        db[collection].find(query).count((err, doc) => {
          if (err) return reject(err);
          return resolve(doc);
        });
      });
    },

    find: async (endpoint, query = {}, fields = {}) => {
      const collection = getModule(endpoint);
      debug('.find called: ', collection, query);
      return new Promise((resolve, reject) => {
        db[collection].find(query, fields, (err, docs) => {
          if (err) return reject(err);
          return resolve(docs);
        });
      });
    },
    modify: async (collection, _id, query) => {
      debug(`.modify called: ${JSON.stringify(query)}`);
      return new Promise((resolve, reject) => {
        db[collection].update({ _id: db.ObjectId(_id) }, query, (err, doc) => (err ? reject(err) : resolve(doc)));
      });
    },
  };
};

module.exports = services;
