class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Obtém um item do cache, removendo-o se estiver expirado.
   * @param {string} key 
   * @returns {any}
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Define um valor no cache com expiração.
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds tempo de vida em segundos
   */
  set(key, value, ttlSeconds) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }

  /**
   * Deleta uma chave específica.
   * @param {string} key 
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Obtém todas as chaves ativas do cache.
   * @returns {string[]}
   */
  keys() {
    const activeKeys = [];
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now <= item.expiry) {
        activeKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }
    return activeKeys;
  }

  /**
   * Limpa chaves que começam com um determinado prefixo.
   * @param {string} prefix 
   */
  clearByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpa todo o cache.
   */
  clear() {
    this.cache.clear();
  }
}

const cacheInstance = new SimpleCache();
module.exports = cacheInstance;
