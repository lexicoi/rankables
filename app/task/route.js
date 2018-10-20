import Route from "@ember/routing/route";
import { get } from "@ember/object";

export default Route.extend({

  model(params) {
    const rankableId = params["rankable_group_id"];
    return get(this, "store").findRecord("rankable", rankableId);
  }
});
