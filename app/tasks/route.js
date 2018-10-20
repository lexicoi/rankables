import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default Route.extend({

  store: service(),

  beforeModel() {
    get(this, "store").findAll("rankable-group").then((rankableGroups) => {
      this.transitionTo("category", rankableGroups.get("firstObject").title);
    });
  }
});
