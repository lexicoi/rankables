import Route from "@ember/routing/route";
import { get } from "@ember/object";

export default Route.extend({

  model(params) {
    const rankableId = params["rankable_id"];

    return get(this, "store").findRecord("rankable", rankableId).then((rankable) => {
      return rankable.get("rankableGroup").then((rankableGroup) => {
        return Ember.RSVP.hash({
          rankableGroup,
          rankable,
          rankables: rankable.get("rankables"),
          rankableGroupRankables: rankableGroup.get("rankables")
        });
      })
    });
  }
});
