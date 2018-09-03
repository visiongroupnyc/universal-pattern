const debug = require('debug')('universal-pattern:controllers');

const controllers = (Application) => {
  const { services, subcontrollers, db } = Application;
  return {
    'universal.insert': async (req, res, next) => {
      debug('.insert called: ');
      const params = req.swagger.params.modeldata.value;
      params.added = new Date();
      if (req.userData) {
        params.user = {
          nickname: req.userData.nickname,
          _id: req.userData._id.toString(),
          profilePhoto: req.userData.profilePhoto,
          firstName: req.userData.firstName,
          lastName: req.userData.lastName,
        };
      }

      if (params.startAt) {
        params.startAt = new Date(params.startAt);
      }

      if (params.endAt) {
        params.endAt = new Date(params.endAt);
      }

      try {
        const data = await subcontrollers(req, res, Application, 'beforeInsert');
        const doc = await services.insert(req.swagger.apiPath, data);
        const dataToResponse = await subcontrollers(req, res, Application, 'afterInsert', doc);
        return res.json(dataToResponse);
      } catch (err) {
        return next(err);
      }
    },

    'universal.insertOrCount': async (req, res, next) => {
      const params = req.swagger.params.modeldata.value;
      try {
        const data = await subcontrollers(req, res, Application, 'beforeInsert', params);
        const doc = await services.insertOrCount(req.swagger.apiPath, data);
        const dataToResponse = await subcontrollers(req, res, Application, 'afterInsert', doc);
        return res.json(dataToResponse);
      } catch (err) {
        return next(err);
      }
    },
    'universal.update': async (req, res, next) => {
      const data = req.swagger.params.modeldata.value;
      const { _id } = data;
      delete data._id;
      debug('.update called: ', _id, data);
      try {
        await subcontrollers(req, res, Application, 'beforeUpdate', data);
        const result = await services.update(req.swagger.apiPath, _id, data);
        await subcontrollers(req, res, Application, 'afterUpdate', result);
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
    'universal.remove': async (req, res, next) => {
      debug('.remove called');
      const _id = req.swagger.params._id.value;

      try {
        await subcontrollers(req, res, Application, 'beforeRemove', { _id });
        const doc = await services.remove(req.swagger.apiPath, _id);
        await subcontrollers(req, res, Application, 'afterRemove', { _id });
        return res.json(doc);
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
        const doc = await subcontrollers(req, res, Application, 'beforeFindone', data);
        const result = await services.findOne(req.swagger.apiPath, doc);
        const dataToResponse = await subcontrollers(req, res, Application, 'afterFindone', result);
        return res.json(dataToResponse);
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

      // remove coordinates if criterial exists
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
      debug('====> query for run: ', q, sorting);

      try {
        const newparams = await subcontrollers(req, res, Application, 'beforeGet', {
          page,
          limit,
          q,
          sorting,
        }, res);

        const result = await services.search(req.swagger.apiPath, {}, newparams, populateFields);
        const resultFinal = await subcontrollers(req, res, Application, 'afterGet', result);
        return res.json(resultFinal);
      } catch (err) {
        return next(err);
      }
    },
  };
};

module.exports = controllers;
