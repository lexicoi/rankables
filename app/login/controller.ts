import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default class LoginController extends Controller {
  username: string = '';
  password: string = '';

  api = service("api");

  actions = {

    login(this: LoginController, event: any) {
      event.preventDefault();

      let username = event.target["username"].value;
      let password = event.target["password"].value;
      get(this, "api").login(username, password);
    }

  }
}
