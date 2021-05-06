const debug = require('debug')('universal-pattern:controllers');

const crypto = require('crypto')
const getCollection = (reqSwaggerApiPath) => reqSwaggerApiPath.substring(1)


const injectDefaultModel = (model, req) => ({
  ...model,
  _v: parseInt(req.swagger.params['x-swagger-model-version'], 10),
  _n: 0,
});

const controllers = (Application) => {
  const { config, services, db,  redis } = Application;

  const lookupProcess = async (params, lookup) => {
    const data = await services.findOne(`/${lookup.collection}`, { _id: db.ObjectId(params[lookup.field]) }, lookup.populate.reduce((a, b) => ({ ...a, [b]: 1 }), {}));
    if (!data) return Promise.reject(new Error(`Invalid value ${lookup.field}(${params[lookup.field]}) for ${lookup.collection}`));
    params[lookup.collection] = data;
    if (data._id) {
      params[lookup.collection]._id = data._id.toString();
    }
    return Promise.resolve(data);
  };

  return {
    'universal.insert': async (req, res, next) => {
      debug('.insert called: ', req.swagger);
      let params = req.swagger.params.modeldata.value;

      try {
        if (req.swagger.params.modeldata && req.swagger.params.modeldata['x-swagger-lookup'] && req.swagger.params.modeldata['x-swagger-lookup'].length > 0) {
          await Promise.all(req.swagger.params.modeldata['x-swagger-lookup'].map(l => lookupProcess(params, l)));
        }

        params.added = new Date();
        if (params.startAt) {
          params.startAt = new Date(params.startAt);
        }

        if (params.endAt) {
          params.endAt = new Date(params.endAt);
        }

        if (Application.hooks['*'] && Application.hooks['*'].beforeInsert) {
          params = await Application.hooks['*'].beforeInsert(req, params, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeInsert) {
          params = await Application.hooks[req.swagger.apiPath].beforeInsert(req, params, Application);
        }


        // check if have  x-swagger-lookup
        let doc = await services.insert(req.swagger.apiPath, injectDefaultModel(params, req));
        if (Application.hooks['*'] && Application.hooks['*'].afterInsert) {
          params = await Application.hooks['*'].afterInsert(req, params, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterInsert) {
          doc = await Application.hooks[req.swagger.apiPath].afterInsert(req, doc, Application);
        }

        // Redis
        const collection = getCollection(req.swagger.apiPath)
        if (['dishtemplates'].includes(collection)){
          if (data.orgId) {
            await redis.deleteKeysByPattern(`${collection}:orgId:${data.orgId}:*`)
            await redis.unlink(`${collection}:orgId:${data.orgId}`)
          }
        }

        if (['dishtemplatesformats'].includes(collection)){
          if (data.dishtemplates) {
            await redis.deleteKeysByPattern(`dishtemplates:orgId:${data.dishtemplates.orgId}:*`)
            await redis.unlink(`dishtemplates:orgId:${data.dishtemplates.orgId}`)
            await redis.deleteKeysByPattern(`dishtemplates:id:${data.dishtemplates._id}:*`)
            await redis.unlink(`dishtemplates:id:${data.dishtemplates._id}`)
          }
        }

        return res.json(doc);
      } catch (err) {
        return next(err);
      }
    },

    'universal.insertOrCount': async (req, res, next) => {
      const params = req.swagger.params.modeldata.value;
      try {
        const doc = await services.insertOrCount(req.swagger.apiPath, injectDefaultModel(params, req));
        return res.json(doc);
      } catch (err) {
        return next(err);
      }
    },
    'universal.update': async (req, res, next) => {
      let data = req.swagger.params.modeldata.value;
      const { _id } = { ...data };

      debug('.update called: ', data);
      try {
        const oldData = await services.findOne(req.swagger.apiPath, {_id})
        if (Application.hooks['*'] && Application.hooks['*'].beforeUpdate) {
          data = await Application.hooks['*'].beforeUpdate(req, data, Application);
        }

        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].beforeUpdate) {
          data = await Application.hooks[req.swagger.apiPath].beforeUpdate(req, data, Application);
        }

        delete data._id;
        const result = await services.update(req.swagger.apiPath, _id, data);
        await services.update(req.swagger.apiPath, _id, {
          $inc: { _n: 1 },
        }, { updated: false, set: false });

        let updateDocument = await services.findOne(req.swagger.apiPath, { _id: db.ObjectId(_id) });

        if (Application.hooks['*'] && Application.hooks['*'].afterUpdate) {
          updateDocument = await Application.hooks['*'].afterUpdate(req, { ...updateDocument, result }, Application);
        }
        if (Application.hooks[req.swagger.apiPath] && Application.hooks[req.swagger.apiPath].afterUpdate) {
          updateDocument = await Application.hooks[req.swagger.apiPath].afterUpdate(req, { ...updateDocument, result }, Application);
        }


        // Redis
        const collection = getCollection(req.swagger.apiPath)
        if (oldData && ['dishtemplates'].includes(collection)){
          if (oldData.orgId) {
            await redis.deleteKeysByPattern(`${collection}:orgId:${oldData.orgId}:*`)
            await redis.unlink(`${collection}:orgId:${oldData.orgId}`)
          }
          await redis.deleteKeysByPattern(`${collection}:id:${oldData._id}:*`)
          await redis.unlink(`${collection}:id:${oldData._id}`)
        }

        if (oldData && ['dishtemplatesformats'].includes(collection)){
          if (oldData.dishtemplates) {
            await redis.deleteKeysByPattern(`dishtemplates:orgId:${oldData.dishtemplates.orgId}:*`)
            await redis.unlink(`dishtemplates:orgId:${oldData.dishtemplates.orgId}`)
            await redis.deleteKeysByPattern(`dishtemplates:id:${oldData.dishtemplates._id}:*`)
            await redis.unlink(`dishtemplates:id:${oldData.dishtemplates._id}`)
          }
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
        const oldData = await services.findOne(req.swagger.apiPath, {_id})
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

        //redis
        if (oldData && ['dishtemplates'].includes(collection)){
          if (oldData.orgId) {
            await redis.deleteKeysByPattern(`${collection}:orgId:${oldData.orgId}:*`)
            await redis.unlink(`${collection}:orgId:${oldData.orgId}`)
          }
          await redis.deleteKeysByPattern(`${collection}:id:${oldData._id}:*`)
          await redis.unlink(`${collection}:id:${oldData._id}`)
        }

        if (oldData && ['dishtemplatesformats'].includes(collection)){
          if (oldData.dishtemplates) {
            await redis.deleteKeysByPattern(`dishtemplates:orgId:${oldData.dishtemplates.orgId}:*`)
            await redis.unlink(`dishtemplates:orgId:${oldData.dishtemplates.orgId}`)
            await redis.deleteKeysByPattern(`dishtemplates:id:${oldData.dishtemplates._id}:*`)
            await redis.unlink(`dishtemplates:id:${oldData.dishtemplates._id}`)
          }
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
            else if (k[1][0] === '¡' && k[1][k[1].length - 1] === '¡') q[k[0]] = { $nin: [k[1].trim().substr(1).slice(0, -1)] };
            else if (k[1][0] === '!' && k[1][k[1].length - 1] === '!') q[k[0]] = { $ne: k[1].trim().substr(1).slice(0, -1) };
            else if (k[1][0] === '>' && k[1][k[1].length - 1] === '>') {
              if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated' || k[0] === 'pickup') {
                q[k[0]] = { $gt: new Date(k[1].trim().substr(1).slice(0, -1)) };
              } else {
                q[k[0]] = { $gt: parseInt(k[1].trim().substr(1).slice(0, -1), 10) };
              }
            } else if (k[1][0] === '<' && k[1][k[1].length - 1] === '<') {
              if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated' || k[0] === 'pickup') {
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
            else if (k[1][0] === '{' && k[1][k[1].length - 1] === '}') {
              const subparts = k[1].trim().substr(1).slice(0, -1).split('|');
              if (subparts.length === 0) return;
              q[k[0]] = { $in: subparts };
            } else {
              if (k[0] === 'startAt' || k[0] === 'endAt' || k[0] === 'added' || k[0] === 'updated' || k[0] === 'pickup') {
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
          }// end if (k.length === 2) {
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
        //redis
        const collection = getCollection(req.swagger.apiPath)
        if (['dishtemplates'].includes(collection)){
          if (q.orgId) {
            const hash = crypto.createHash('sha256').update(JSON.stringify({q, page, limit, sorting})).digest('hex').substring(48)
            const result = await redis.get(`${collection}:orgId:${q.orgId}:query:${hash}`)
            if (result) debug('REDIS FINDED')
            if (result) console.log('REDIS FINDED')
            if (result) return res.json(JSON.parse(result))
          }
        }


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

        //redis
        if (['dishtemplates'].includes(collection)){
          if (q.orgId) {
            const hash = crypto.createHash('sha256').update(JSON.stringify({q, page, limit, sorting})).digest('hex').substring(48)
            await redis.set(`${collection}:orgId:${q.orgId}:query:${hash}`, JSON.stringify(result), 'EX', redis.configTls[collection])
            debug('REDIS SAVED ORGID')
            console.log('REDIS SAVED ORGID')
          } else if (q._id) {
            const hash = crypto.createHash('sha256').update(JSON.stringify({q, page, limit, sorting})).digest('hex').substring(48)
            await redis.set(`${collection}:id:${q._id}:query:${hash}`, JSON.stringify(result), 'EX', redis.configTls[collection])
            debug('REDIS SAVED ID')
            console.log('REDIS SAVED ID')
          }
        }

        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  };
};

module.exports = controllers;
