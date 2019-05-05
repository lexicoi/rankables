import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default class SignUpController extends Controller {
  username: string = '';
  password: string = '';
  passwordConfirmation: string = '';

  api = service("api");

  actions = {

    signUp(this: SignUpController, event: any) {
      event.preventDefault();

      let username = event.target["username"].value;
      let password = event.target["password"].value;
      let passwordConfirmation = event.target["password-confirmation"].value;
      get(this, "api").register(username, password, passwordConfirmation).then(() => {
        event.target["username"].value = null;
        event.target["password"].value = null;
        event.target["password-confirmation"].value = null;
        this.transitionToRoute("login");
      });
    }

  }
}
