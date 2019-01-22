import Controller from "@ember/controller";
import Rankable from "rankables/models/rankable";
import RankableGroup from "rankables/models/rankable-group";
import { set, get } from "@ember/object";
import { produce } from "immer";
import { resetRankings } from "rankables/base/tasks/compare/utils";

export default class BaseTasksTaskController extends Controller {

  actions = {

    updateRankable(model: Rankable, key: "title" | "description", event: any) {
      if (event && event.target) {
        const newVal = event.target.value;
        if (newVal === get(model, key)) {
          return
        }

        set(model, key, newVal);
        model.save();
      }
    },

    deleteRankable(this: BaseTasksTaskController, model: Rankable) {
      // TODO: Edit model so rankableGroup is not a proxy

      // Check if it's in rankableGroup.rankables. If so, delete it
      // Check to see if it's in rankableGroup.rankings. If so delete it
      // If the rankings have been changed re-rank everything

      const rankableGroup = get(model, "rankableGroup").content;
      const newRankings = produce(rankableGroup.rankings, draftRankings => {
        draftRankings.removeObject(model.id);
      })

      set(rankableGroup, "rankings", newRankings);
      rankableGroup.save().then((rankableGroup: RankableGroup) => {
        resetRankings(this.store, newRankings, get(rankableGroup, "rankings")).then(() => {
          model.destroyRecord().then(() => {
            this.transitionToRoute("base.tasks", rankableGroup.title);
          });
        });
      })

    }

  }

}
