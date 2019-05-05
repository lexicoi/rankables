//@ts-ignore
import Base from "ember-simple-auth/authenticators/base";
import { inject as service } from "@ember/service";
import { get, set } from "@ember/object";
import { isEmpty } from "@ember/utils";

export default class PouchdbAuthenticator extends Base {

  store = service("store");

  database: any;

  getDatabase() {
    if (get(this, "database")) {
      return get(this, "database");
    }

    const pouchDbAdapterName = "application";
    //@ts-ignore
    const pouchDbAdapter = get(this, "store").adapterFor(pouchDbAdapterName);

    debugger;
    if (!pouchDbAdapter) {
      throw "An ember-pouch adapter must be setup for authentication";
    }

    set(this, "database", pouchDbAdapter.db);

    return get(this, "database");
  };

  restore(data) {
    return this.getDatabase().getSession().then((response) => {
      let result = null;
      if (!isEmpty(data.name) && response.userCtx.name === data.name) {
        result = response.userCtx;
        this.getDatabase().emit("loggedIn");
      } else {
        throw "Not logged in or incorrect cookie";
      }

      return result;
    })
  };

  authenticate(username: string, password: string) {
    return this.getDatabase().login(username, password)
      .then(() => this.getDatabase().getSession())
      .then((response) => {
        this.getDatabase().emit("loggedIn");
        return response.userCtx
      })
  };

  invalidate() {
    // It's not technically possible to invalidate session cookies,
    // but we can log the user out, though the previous session cookie
    // technically will persist.
    let result = this.getDatabase().logout();
    this.getDatabase().emit("loggedOut");
    return result;
  };

};
