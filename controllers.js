const debug = require('debug')('universal-pattern:controllers');

const controllers = (Application) => {
  const { services, db } = Application;
  return {
    'universal.insert': async (req, res, next) => {
      debug('.insert called: ', req.swagger.params.modeldata.value);
      let params = req.swagger.params.modeldata.value;
      params.added = new Date();
      if (params.startAt) {
        params.startAt = new Date(params.startAt);
      }

      if (params.endAt) {
        params.endAt = new Date(params.endAt);
      }

      try {
        if (Application.hooks['*'] && Application.hooks['*'].beforeInsert) {
          params = await Application.hooks['*'].beforeInsert(req, params, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeInsert) {
          params = await Application.hooks[req.swagger.apiPath].beforeInsert(req, params, Application);
        }
        let doc = await services.insert(req.swagger.apiPath, params);
        if (Application.hooks['*'] && Application.hooks['*'].afterInsert) {
          params = await Application.hooks['*'].afterInsert(req, params, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterInsert) {
          doc = await Application.hooks[req.swagger.apiPath].afterInsert(req, doc, Application);
        }
        return res.json(doc);
      } catch (err) {
        return next(err);
      }
    },

    'universal.insertOrCount': async (req, res, next) => {
      const params = req.swagger.params.modeldata.value;
      try {
        const doc = await services.insertOrCount(req.swagger.apiPath, params);
        return res.json(doc);
      } catch (err) {
        return next(err);
      }
    },
    'universal.update': async (req, res, next) => {
      let data = req.swagger.params.modeldata.value;
      const { _id } = data;
      delete data._id;
      debug('.update called: ', _id, data);
      try {
        if (Application.hooks['*'] && Application.hooks['*'].beforeUpdate) {
          data = await Application.hooks['*'].beforeUpdate(req, data, Application);
        }

        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeUpdate) {
          data = await Application.hooks[req.swagger.apiPath].beforeUpdate(req, data, Application);
        }

        const result = await services.update(req.swagger.apiPath, _id, data);
        let updateDocument = await services.findOne(req.swagger.apiPath, _id);

        if (Application.hooks['*'] && Application.hooks['*'].afterUpdate) {
          updateDocument = await Application.hooks['*'].afterUpdate(req, { ...updateDocument, result }, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterUpdate) {
          updateDocument = await Application.hooks[req.swagger.apiPath].afterUpdate(req, { ...updateDocument, result }, Application);
        }

        return res.json({ ...updateDocument, result });
      } catch (err) {
        return next(err);
      }
    },
    'universal.remove': async (req, res, next) => {
      const _id = req.swagger.params._id.value;
      debug('.remove called: ', _id);
      try {
        if (Application.hooks['*'] && Application.hooks['*'].beforeRemove) {
          await Application.hooks['*'].beforeRemove(req, _id, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeRemove) {
          await Application.hooks[req.swagger.apiPath].beforeRemove(req, _id, Application);
        }

        let removedDocument = await services.findOne(req.swagger.apiPath, { _id: db.ObjectId(_id) });
        const result = await services.remove(req.swagger.apiPath, _id);

        if (Application.hooks['*'] && Application.hooks['*'].afterRemove) {
          removedDocument = await Application.hooks['*'].afterRemove(req, { ...removedDocument, result }, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterRemove) {
          removedDocument = await Application.hooks[req.swagger.apiPath].afterRemove(req, { ...removedDocument, result }, Application);
        }

        return res.json({ ...removedDocument, result });
      } catch (err) {
        return next(err);
      }
    },
    'universal.today': async (req, res, next) => {
      debug('.today called');
      try {
        const data = await services.today(req.swagger.apiPath);
        return res.json(data);
      } catch (err) {
        return next(err);
      }
    },
    'universal.findOne': async (req, res, next) => {
      debug('.findOne called');
      const data = req.swagger.params.data.value;
      try {
        const result = await services.findOne(req.swagger.apiPath, data);
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
    'universal.search': async (req, res, next) => {
      debug('.search called: ', req.swagger.params);
      let q = req.swagger.params.q.value;
      let sorting = req.swagger.params.sorting.value;
      const page = req.swagger.params.page.value;
      const limit = req.swagger.params.limit.value;
      const fields = req.swagger.params.fields.value;
      const distinct = req.swagger.params && req.swagger.params.distinct ? req.swagger.params.distinct.value : null;
      let coordinates = null;


      if (req.swagger.params.coordinates) coordinates = req.swagger.params.coordinates.value;

      if (q) {
        const parts = q.split(',');
        q = {};
        parts.forEach((i) => {
          const k = i.split(':');
          if (k.length === 2) {
            if (k[0] === '_id') q[k[0]] = db.ObjectId(k[1].trim());
            else if (k[0][0] === '_') q[k[0].substr(1)] = db.ObjectId(k[1].trim());
            else if (k[1][0] === '/' && k[1][k[1].length - 1] === '/') q[k[0]] = RegExp(k[1].trim().substr(1).slice(0, -1), 'i');
            else if (k[1][0] === '!' && k[1][k[1].length - 1] === '!') q[k[0]] = { $ne: k[1].trim().substr(1).slice(0, -1) };
            else if (k[1][0] === '>' && k[1][k[1].length - 1] === '>') {
              if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated') {
                q[k[0]] = { $gt: new Date(k[1].trim().substr(1).slice(0, -1)) };
              } else {
                q[k[0]] = { $gt: parseInt(k[1].trim().substr(1).slice(0, -1), 10) };
              }
            } else if (k[1][0] === '<' && k[1][k[1].length - 1] === '<') {
              if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated') {
                q[k[0]] = { $lt: new Date(k[1].trim().substr(1).slice(0, -1)) };
              } else {
                q[k[0]] = { $lt: parseInt(k[1].trim().substr(1).slice(0, -1), 10) };
              }
            } else if (k[1][0] === '.' && k[1][k[1].length - 1] === '.') q[k[0]] = parseInt(k[1].trim().substr(1).slice(0, -1), 10);
            else if (k[1][0] === '|' && k[1][k[1].length - 1] === '|') q[k[0]] = k[1].trim().substr(1).slice(0, -1) === 'true';
            else if (k[1][0] === '[' && k[1][k[1].length - 1] === ']') {
              // special AND
              const subparts = k[1].trim().substr(1).slice(0, -1).split('|');
              if (subparts.length !== 2) return;
              if (!('$and' in q)) q.$and = [];
              const item1 = {};
              item1[k[0]] = { $gt: parseInt(subparts[0], 10) };
              q.$and.push(item1);

              const item2 = {};
              item2[k[0]] = { $lt: parseInt(subparts[1], 10) };
              q.$and.push(item2);
            } else if (k[1].toUpperCase() === 'NULL') q[k[0]] = null;
            else if (k[1].toUpperCase() === 'NOTNULL') q[k[0]] = { $ne: null };
            else {
              if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated') {
                const today = new Date(k[1].trim());
                const nextDay = new Date(k[1].trim());
                if (!('$and' in q)) q.$and = [];
                const item1 = {};
                item1[k[0]] = { $gt: today };
                q.$and.push(item1);

                nextDay.setDate(nextDay.getDate() + 1);
                const item2 = {};
                item2[k[0]] = { $lt: nextDay };
                q.$and.push(item2);
              } else {
                q[k[0]] = k[1].trim();
              }
            }
          }
        });
      }
      if (coordinates && coordinates !== '' && coordinates !== '0,0,0') {
        debug('with coordinates: ', coordinates);
        const parts = coordinates.split(',');
        if (parts.length === 3) {
          if (!q) q = {};
          q.location = {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(parts[0]), parseFloat(parts[1])],
              },
              $maxDistance: parseInt(parts[2], 10), // > 100000 ? 100000 : parseInt(parts[2], 10),
            },
          };
        }
      }
      if (q && typeof q.criterial !== 'undefined') delete q.location;
      if (sorting) {
        const props = sorting.split(',');
        sorting = {};
        props.forEach((p) => {
          const parts = p.split(':');
          if (parts.length === 2) sorting[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
        });
      }

      const populateFields = {};
      if (fields && fields !== '') {
        fields.split(',').forEach((f) => {
          populateFields[f.trim()] = 1;
        });
      }
      req.q = q;
      try {
        const searchParams = {
          page,
          limit,
          q,
          sorting,
        };
        if (Application.hooks['*'] && Application.hooks['*'].beforeSearch) {
          q = await Application.hooks['*'].beforeSearch(req, searchParams, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeSearch) {
          q = await Application.hooks[req.swagger.apiPath].beforeSearch(req, searchParams, Application);
        }

        let result = {};
        if (distinct && distinct.length > 0) {
          const ids = await services.distinct(req.swagger.apiPath, distinct, searchParams.q);
          console.info('ids: ', ids);
          const docs = await Promise.all(
            ids.map(id => services.findOne(req.swagger.apiPath, { [distinct]: id }, {})),
          );
          result = {
            docs,
            page: 1,
            limit: docs.length,
            count: docs.length,
            totalPages: 1,
            distinct: true,
          };
        } else {
          result = await services.search(req.swagger.apiPath, {}, searchParams, populateFields);
        }

        if (Application.hooks['*'] && Application.hooks['*'].afterSearch) {
          result = await Application.hooks['*'].afterSearch(req, result, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterSearch) {
          result = await Application.hooks[req.swagger.apiPath].afterSearch(req, result, Application);
        }
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  };
};

module.exports = controllers;
