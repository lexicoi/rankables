import Controller from "@ember/controller";
import RankableGroup from "rankables/models/rankable-group";
import Rankable from "rankables/models/rankable";
import { set, get } from "@ember/object";
import Ember from "ember";
//@ts-ignore
import tailored from "tailored";

const $ = tailored.variable();
const _ = tailored.wildcard();

export default class BaseTasksController extends Controller {

  actions = {

    updateRankableGroupTitle(this: BaseTasksController, rankableGroup: RankableGroup, event: any) {
      if (event && event.target) {
        if (event.target.value === rankableGroup.title) {
          return
        }

        set(rankableGroup, "title", event.target.value);
        rankableGroup.save();
      }
    },

    deleteRankableGroup(this: BaseTasksController, rankableGroup: RankableGroup) {
      /* Right now the build hangs if you specify the ArrayPrototype, e.g. Promise<Rankable> */
      let promisesToResolve: any = [];
      get(rankableGroup, "rankables").forEach((rankable: Rankable) => {
        promisesToResolve.pushObject(rankable.destroyRecord());
      });

      Ember.RSVP.all(promisesToResolve).then(() => {
        rankableGroup.destroyRecord().then(() => {
          this.transitionToRoute("base");
        });
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
