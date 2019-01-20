import Controller from "@ember/controller";
import RankableGroup from "compare/models/rankable-group";
import Rankable from "compare/models/rankable";
import Ember from "ember";
//@ts-ignore
import tailored from "tailored";

const $ = tailored.variable();
const _ = tailored.wildcard();

export default class BaseTasksController extends Controller {

  actions = {

    deleteRankableGroup(this: BaseTasksController, rankableGroup: RankableGroup) {
      let promisesToResolve: Promise<any>[] = [];
      rankableGroup.rankables.forEach((rankable) => {
        promisesToResolve.pushObject(rankable.destroyRecord());
      });

      Ember.RSVP.all(promisesToResolve).then(() => {
        rankableGroup.destroyRecord();
      });
    },

    addNewRankable(rankableTitle: string, rankableGroup: RankableGroup, store: any, event: FocusEvent) {
      tailored.defmatch(
        tailored.clause([{
          rankableTitle: $,
          rankableGroup: $,
          store: $,
          event: $
        }], (rankableTitle: string, rankableGroup: RankableGroup, store: any, event: FocusEvent) => {
          event.preventDefault();

          store.createRecord("rankable", {
            title: rankableTitle,
            rankableGroup: rankableGroup
          }).save().then((rankable: Rankable) => {
            rankable.reload();
            const eventTarget: any = event.target;
            eventTarget.value = null;
          })
        }, (rankableTitle: string, rankableGroup: RankableGroup, store: any, event: FocusEvent) =>
          Boolean(rankableTitle) && Boolean(rankableGroup) && Boolean(store) && Boolean(event)),

        tailored.clause([_], () => {
          console.log("Perhaps some sort of error later?");
        })

      )({ rankableTitle, rankableGroup, store, event });
    }
  }
}
