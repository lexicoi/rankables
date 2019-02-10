import Route from "@ember/routing/route";
import { get } from "@ember/object";
import Ember from "ember";

interface ParametersInterface {
  "rankable-id": string;
}

export default class BaseTasksTaskRoute extends Route {

  model(params: ParametersInterface) {
    return Ember.RSVP.hash({
      rankable: get(this, "store").findRecord("rankable", params["rankable-id"]),
      rankableGroup: this.modelFor("base.tasks").rankableGroup
    })
  }
}
