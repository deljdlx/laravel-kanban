// Lightweight User models to represent board authors without changing external API


export class User {
  /** @type {string} Identifiant utilisateur */
  id = '';
  /** @type {string} Nom utilisateur */
  name = '';
  /** @type {string|undefined} Avatar (URL ou identifiant) */
  avatar = undefined;

  /**
   * Crée une instance de User.
   * @param {string} id - Identifiant utilisateur
   * @param {string} name - Nom utilisateur
   * @param {string|undefined} [avatar] - Avatar (URL ou identifiant)
   */
  constructor(id, name, avatar = undefined) {
    this.id = String(id);
    this.name = String(name ?? '');
    this.avatar = (avatar != null) ? String(avatar) : undefined;
  }

  toJSON() {
    return { id: this.id, name: this.name, ...(this.avatar ? { avatar: this.avatar } : {}) };
  }
}

export class Users {
  constructor(list) {
    const arr = Array.isArray(list) ? list : [];
  this._list = arr.map(u => (u instanceof User ? u : new User(u.id, u.name, u.avatar)));
    this._byId = new Map(this._list.map(u => [u.id, u]));
  }

  all() { return this._list.slice(); }
  getById(id) { return this._byId.get(String(id)) || null; }
  getName(id) { return this.getById(id)?.name || null; }
  toJSON() { return this._list.map(u => u.toJSON()); }
}
