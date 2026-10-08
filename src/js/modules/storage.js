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
      return this.#objectKeyReadLocalStorage(key, objectKey);
    } else {
      return this.#objectKeyReadSessionStorage(key, objectKey);
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
  #isSessionCache;
  #entryLifeMS;

  #expireCache() {
    const keys = this.#storage.keys(this.#isSessionCache);
    if (!keys || !keys.forEach) return;
    const now = Date.now();
    keys.forEach(key => {
      const record = this.#storage.objectRead(key, this.#isSessionCache);
      const expireDT = record.updated + this.#entryLifeMS;
      const isExpired = expireDT < now;
      if (record && isExpired) {
        this.deleteCache(key);
      }
    });
  }

  constructor({entryLifeMS = 86400000/*3000 = 3 sec*//*60000 = 1 min*//*300000 = 5 min*//*3600000 = 1 hour*//*86400000 = 1 day*/, isSessionCache = true} = {}) {
    this.#isSessionCache = isSessionCache;
    this.#entryLifeMS = entryLifeMS;
    this.#storage = new Storage();
  }

  hasCache(key) {
    this.#expireCache();
    return this.#storage.hasKey(key, this.#isSessionCache);
  }

  getCache(key) {
    this.#expireCache();
    const record = this.#storage.objectRead(key, this.#isSessionCache);
    return record ? record.entry : undefined;
  }

  setCache(key, value) {
    this.#expireCache();
    const now = Date.now();
    const entry = {
      created: now,
      updated: now,
      entry: value
    };
    if (this.#storage.hasKey(key, this.#isSessionCache)) {
      const existing = this.#storage.hasKey(key, this.#isSessionCache);
      if (existing) {
        entry.created = existing.created;
      }
    }
    this.#storage.objectWrite(key, entry, this.#isSessionCache);
  }

  deleteCache(key) {
    this.#storage.remove(key, this.#isSessionCache);
  }

  clearCache() {
    this.#storage.clear(this.#isSessionCache);
  }
}
