import Route from "@ember/routing/route";
import RankableGroup from "compare/models/rankable-group";
import Ember from "ember";

import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default class TasksRoute extends Route.extend({
  store: service("store")
}) {

  model(params: object) {
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
