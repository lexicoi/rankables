import Route from "@ember/routing/route";
import { get } from "@ember/object";

interface ParametersInterface {
  "rankable-id": string;
}

export default class BaseTasksTaskRoute extends Route {

  model(params: ParametersInterface) {
    return get(this, "store").findRecord("rankable", params["rankable-id"]);
  }
}
