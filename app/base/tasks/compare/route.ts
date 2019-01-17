import Route from "@ember/routing/route";
import { get, set } from "@ember/object";
import Ember from "ember";
import RankableGroup from "compare/models/rankable-group";
import Rankable from "compare/models/rankable";

interface ParametersInterface {
  "rankable-id": string
}

export default class BaseTasksCompareRoute extends Route {

  model(params: ParametersInterface) {
    const baseTasksModel: any = this.modelFor("base.tasks");
    const rankableGroup: RankableGroup = baseTasksModel.rankableGroup;
    const rankables: Rankable[] = baseTasksModel.rankables;

    return Ember.RSVP.hash({
      rankableGroup: rankableGroup,
      rankables: rankables,
      rankings: get(rankableGroup, "rankings"),
      rankable: get(this, "store").findRecord("rankable", params["rankable-id"]),
      upperBound: Number.MAX_SAFE_INTEGER,
      lowerBound: 0
    });
  };

  afterModel(model: any) {
    let rankable: Rankable = model.rankable;
    let rankableGroup: RankableGroup = model.rankableGroup;

    if (get(rankable, "rank") === 0 && get(rankableGroup, "rankings").length === 0) {
      set(rankable, "rank", 1);
      rankable.save().then((rankable: Rankable) => {
        get(rankableGroup, "rankings").pushObject(rankable.id);
        rankableGroup.save();
      });
    }
  };

}
