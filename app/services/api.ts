import Service from "@ember/service";

import config from "../config/environment";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";

//@ts-ignore
const API_URL = config.apiURL;

export default class ApiService extends Service {
  ajax = service();
  session = service();

  login(this: ApiService, username: string, password: string) {
    //@ts-ignore
    get(this, "session").authenticate("authenticator:pouchdb", username, password);
  };

  register(this: ApiService, username: string, password: string, passwordConfirmation: string) {
    //@ts-ignore
    return get(this, "ajax").post(`${API_URL}/api/register`, {
      headers: { "Content-Type": "application/json" },
      data: {
        data: { /* This is on purpose. JSON-API requests this data key */
          type: "users",
          attributes: {
            username: username,
            password: password,
            "password-confirmation": passwordConfirmation
          }
        }
      }
    })
  }
};

declare module "@ember/service" {
  interface Registry {
    "api": ApiService
  }
}
