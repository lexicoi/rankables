import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default Route.extend({

  store: service(),

  model(params) {
    const rankableGroupTitle = params["rankable_group_title"];
    return get(this, "store").queryRecord("rankable-group",  {
      filter: { title: rankableGroupTitle }
    }).then((rankableGroup) => {
      return Ember.RSVP.hash({
        rankables: rankableGroup.rankables,
        rankableGroup: rankableGroup,
        rankableGroups: get(this, "store").findAll("rankable-group")
      })
    })
  }

});
