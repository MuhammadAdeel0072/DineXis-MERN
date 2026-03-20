const NodeCache = require('node-cache');
const menuCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 minutes TTL

const getCachedMenu = () => {
  return menuCache.get('full_menu');
};

const setCachedMenu = (menuData) => {
  menuCache.set('full_menu', menuData);
};

const clearMenuCache = () => {
  menuCache.del('full_menu');
};

module.exports = { getCachedMenu, setCachedMenu, clearMenuCache };
