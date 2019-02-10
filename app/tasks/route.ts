import Route from "@ember/routing/route";
import RankableGroup from "rankables/models/rankable-group";
import Ember from "ember";

import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default class BaseTasksRoute extends Route.extend({
  store: service("store")
}) {

  model(params: any) {
    const rankableGroupTitle = params["rankable-group-title"];
    return get(this, "store").queryRecord("rankable-group", {
      filter: { title: rankableGroupTitle }
    }).then((rankableGroup: RankableGroup) => {
      return Ember.RSVP.hash({
        rankableGroup: rankableGroup,
        rankables: rankableGroup.get("rankables")
      })
    })
  }

}
