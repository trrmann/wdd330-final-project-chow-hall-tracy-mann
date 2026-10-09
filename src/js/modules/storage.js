export class Storage {
  #baseReadLocalStorage(key) {
    return localStorage.getItem(key);
  }
  #removeLocalStorage(key) {
    localStorage.removeItem(key);
  }
  #baseWriteLocalStorage(key, value) {
    localStorage.setItem(key, value);
  }
  #baseReadSessionStorage(key) {
    return sessionStorage.getItem(key);
  }
  #removeSessionStorage(key) {
    sessionStorage.removeItem(key);
  }
  #baseWriteSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
  }
  #sizeLocalStorage() {
    return localStorage.length;
  }
  #sizeSessionStorage() {
    return sessionStorage.length;
  }
  #localStorageKeys() {
    return Object.keys(localStorage);
  }
  #sessionStorageKeys() {
    return Object.keys(sessionStorage);
  }
  #localStorageHasKey(key) {
    return this.#localStorageKeys().includes(key);
  }
  #sessionStorageHasKey(key) {
    return this.#sessionStorageKeys().includes(key);
  }
  #clearLocalStorage() {
    localStorage.clear();
  }
  #clearSessionStorage() {
    sessionStorage.clear();
  }
  #objectReadLocalStorage(key) {
    const storedData = this.#baseReadLocalStorage(key);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return parsedData;
    } else {
      return {};
    }
  }
  #objectWriteLocalStorage(key, object) {
    this.#baseWriteLocalStorage(key, JSON.stringify(object));
  }
  #objectReadSessionStorage(key) {
    const storedData = this.#baseReadSessionStorage(key);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return parsedData;
    } else {
      return {};
    }
  }
  #objectWriteSessionStorage(key, object) {
    this.#baseWriteSessionStorage(key, JSON.stringify(object));
  }
  #objectKeyReadLocalStorage(key, objectKey) {
    return this.#objectReadLocalStorage(key)[objectKey];
  }
  #objectKeyWriteLocalStorage(key, objectKey, value) {
    const localObject = this.#objectReadLocalStorage(key) || {};
    localObject[objectKey] = value;
    this.#objectWriteLocalStorage(key, localObject);
  }
  #objectKeyReadSessionStorage(key, objectKey) {
    return this.#objectReadSessionStorage(key)[objectKey];
  }
  #objectKeyWriteSessionStorage(key, objectKey, value) {
    const localObject = this.#objectReadSessionStorage(key) || {};
    localObject[objectKey] = value;
    this.#objectWriteSessionStorage(key, localObject);
  }
  constructor() {}
  read(key, session = true) {
    if (session) {
      return this.#baseReadSessionStorage(key);
    } else {
      return this.#baseReadLocalStorage(key);
    }
  }
  remove(key, session = true) {
    if (session) {
      this.#removeSessionStorage(key);
    } else {
      this.#removeLocalStorage(key);
    }
  }
  write(key, value, session = true) {
    if (session) {
      this.#baseWriteSessionStorage(key, value);
    } else {
      this.#baseWriteLocalStorage(key, value);
    }
  }
  size(session = true) {
    if (session) {
      return this.#sizeSessionStorage();
    } else {
      return this.#sizeLocalStorage();
    }
  }
  keys(session = true) {
    if (session) {
      return this.#sessionStorageKeys();
    } else {
      return this.#localStorageKeys();
    }
  }
  hasKey(key, session = true) {
    if (session) {
      return this.#sessionStorageHasKey(key);
    } else {
      return this.#localStorageHasKey(key);
    }
  }
  clear(session = true) {
    if (session) {
      this.#clearSessionStorage();
    } else {
      this.#clearLocalStorage();
    }
  }
  objectRead(key, session = true) {
    if (session) {
      return this.#objectReadSessionStorage(key);
    } else {
      return this.#objectReadLocalStorage(key);
    }
  }
  objectWrite(key, object, session = true) {
    if (session) {
      this.#objectWriteSessionStorage(key, object);
    } else {
      this.#objectWriteLocalStorage(key, object);
    }
  }
  objectKeyRead(key, objectKey, session = true) {
    if (session) {
      return this.#objectKeyReadSessionStorage(key, objectKey);
    } else {
      return this.#objectKeyReadLocalStorage(key, objectKey);
    }
  }
  objectKeyWrite(key, objectKey, value, session = true) {
    if (session) {
      this.#objectKeyWriteSessionStorage(key, objectKey, value);
    } else {
      this.#objectKeyWriteLocalStorage(key, objectKey, value);
    }
  }
}

export class Cache {
  #storage;
  #entries;
  #storagePrefix;
  #isSessionCache;
  #entryLifeMS;

  #getStorageKey(key) {
    return `${this.#storagePrefix}${encodeURIComponent(key)}`;
  }

  #getNamespacedKeys() {
    return this.#storage.keys(this.#isSessionCache)
      .filter(key => key.startsWith(this.#storagePrefix));
  }

  #expireCache() {
    const now = Date.now();
    if (this.#entries) {
      this.#entries.forEach((record, key) => {
        if (record.updated + this.#entryLifeMS < now) {
          this.#entries.delete(key);
        }
      });
      return;
    }
    this.#getNamespacedKeys().forEach(key => {
      const record = this.#storage.objectRead(key, this.#isSessionCache);
      if (record && record.updated + this.#entryLifeMS < now) {
        this.#storage.remove(key, this.#isSessionCache);
      }
    });
  }

  constructor({
    entryLifeMS = 86400000,
    isSessionCache = true,
    namespace = 'default',
    storage = 'session'
  } = {}) {
    if (typeof namespace !== 'string' || !namespace.trim()) {
      throw new TypeError('Cache namespace must be a non-empty string');
    }
    if (!['memory', 'session'].includes(storage)) {
      throw new TypeError('Cache storage must be either "memory" or "session"');
    }
    this.#isSessionCache = isSessionCache;
    this.#entryLifeMS = entryLifeMS;
    this.#storage = new Storage();
    this.#entries = storage === 'memory' ? new Map() : null;
    this.#storagePrefix = `cache:${encodeURIComponent(namespace)}:`;
  }

  hasCache(key) {
    this.#expireCache();
    return this.#entries ?
      this.#entries.has(key) :
      this.#storage.hasKey(this.#getStorageKey(key), this.#isSessionCache);
  }

  getCache(key) {
    this.#expireCache();
    const record = this.#entries ?
      this.#entries.get(key) :
      this.#storage.objectRead(this.#getStorageKey(key), this.#isSessionCache);
    return record ? record.entry : undefined;
  }

  setCache(key, value) {
    this.#expireCache();
    const now = Date.now();
    const existing = this.#entries ?
      this.#entries.get(key) :
      this.#storage.objectRead(this.#getStorageKey(key), this.#isSessionCache);
    const entry = {
      created: existing?.created ?? now,
      updated: now,
      entry: value
    };
    if (this.#entries) {
      this.#entries.set(key, entry);
    } else {
      this.#storage.objectWrite(this.#getStorageKey(key), entry, this.#isSessionCache);
    }
  }

  deleteCache(key) {
    if (this.#entries) {
      this.#entries.delete(key);
    } else {
      this.#storage.remove(this.#getStorageKey(key), this.#isSessionCache);
    }
  }

  clearCache() {
    if (this.#entries) {
      this.#entries.clear();
    } else {
      this.#getNamespacedKeys().forEach(key =>
        this.#storage.remove(key, this.#isSessionCache)
      );
    }
  }
}
