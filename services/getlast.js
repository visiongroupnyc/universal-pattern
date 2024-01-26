const debug = require('debug')('up:services:getLast');

function getLastFactory({
  getModule,
  db,
}) {
  return async (endpoint, query = {}, fields = {}) => {
    const collection = getModule(endpoint);
    debug('.getLast: ', collection, query, fields);
    return new Promise((resolve, reject) => {
      db[collection].find(query, fields)
        .sort({ _id: 1 }, (err, doc) => {
          if (err) return reject(err);
          return resolve(doc.length > 0 ? doc.pop() : null);
        });
    });
  }
}

module.exports = getLastFactory;