const debug = require('debug')('universal-pattern:subcontrollers');


const subcontrollers = (Application) => {
  debug('subcontrollers instance called');
  const { getModule } = Application;
  const subcontrollersMap = Application.localOptions.subcontrollers;

  return (req, res, appInstance, action = 'beforeGet', data = {}) => {
    const module = getModule(req.url);
    if (module in subcontrollersMap && action in subcontrollersMap[module]) {
      return subcontrollersMap[module][action](req, res, appInstance, data);
    }
    return Promise.resolve(data);
  };
};

module.exports = subcontrollers;
