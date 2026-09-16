const session = require('express-session');
const { db, COLLECTIONS } = require('./db');

const SESSION_TTL_MS = 30 * 60 * 1000; // matches web.xml 30-minute timeout

class FirestoreStore extends session.Store {
  constructor(options = {}) {
    super();
    this.collection = db.collection(COLLECTIONS.SESSIONS);
    this.ttl = options.ttl || SESSION_TTL_MS;
  }

  get(sid, cb) {
    this.collection.doc(sid).get()
      .then((snap) => {
        if (!snap.exists) return cb(null, null);
        const data = snap.data();
        if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
          return this.destroy(sid, () => cb(null, null));
        }
        cb(null, data.session);
      })
      .catch((e) => cb(e));
  }

  set(sid, sess, cb) {
    this.collection.doc(sid).set({
      session: sess && typeof sess === 'object' ? Object.assign({}, sess) : sess,
      expiresAt: new Date(Date.now() + this.ttl),
    })
      .then(() => cb(null))
      .catch((e) => cb(e));
  }

  destroy(sid, cb) {
    this.collection.doc(sid).delete()
      .then(() => cb(null))
      .catch((e) => cb(e));
  }

  touch(sid, sess, cb) {
    const data = sess || {};
    this.collection.doc(sid).update({
      session: typeof data === 'object' ? Object.assign({}, data) : data,
      expiresAt: new Date(Date.now() + this.ttl),
    }).then(() => cb(null)).catch(() => cb(null));
  }
}

module.exports = { FirestoreStore, SESSION_TTL_MS };