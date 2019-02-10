import Controller from "@ember/controller";
import Rankable from "rankables/models/rankable";
import RankableGroup from "rankables/models/rankable-group";
import { computed, get, set } from "@ember/object";
import { alias } from '@ember/object/computed';
import produce from "immer";
//@ts-ignore
import tailored from "tailored";
import { resetRankings } from "./utils";

const $ = tailored.variable();

export default class BaseTasksCompareController extends Controller {

  previousCurrentRankableId = alias("model.previousCurrentRankableId");
  previousComparison = alias("model.previousComparison")
  lowerBound = alias("model.lowerBound");
  upperBound = alias("model.upperBound");

  // This is the ranking list taking into account where you are in the comparison sequence
  newRankings = computed(
    "model.rankings.[]", 
    "model.rankable",
    "model.upperBound",
    "model.lowerBound",
    function(this: BaseTasksCompareController): string[] {
      const model = get(this, "model");
      const rankableToCompare = get(model, "rankable");

      const lowerBound = get(this, "lowerBound");
      const upperBound = get(this, "upperBound");

      let tempRankings = get(model, "rankings");
      tempRankings.removeObject(get(rankableToCompare, "id"))
      return tempRankings.slice(lowerBound, upperBound);
    }
  );

  // This represents rankings that will be saved, if desired
  tentativeRankings = computed(
    "newRankings",
    "previousCurrentRankableId",
    "previousComparison",
    "model.rankable",
    "model.rankings",
    function(this: BaseTasksCompareController): string[] {
      const rankings = this.model.rankings;
      const previousCurrentRankableId = this.previousCurrentRankableId;
      const rankableId = this.model.rankable.id;
      let previousRankableIndex = rankings.indexOf(previousCurrentRankableId);

      return tailored.defmatch(
        tailored.clause(["greater"], () => {
          return produce(rankings, draftRankings => {
            draftRankings.removeObject(previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex, rankableId);
            draftRankings.insertAt(previousRankableIndex + 1, previousCurrentRankableId);
            return draftRankings;
          });
        }),

        tailored.clause(["lesser"], () => {
          return produce(rankings, draftRankings => {
            draftRankings.removeObject(previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex, previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex + 1, rankableId);
            return draftRankings;
          });
        }),

        tailored.clause([""], () => {
          return null;
        })

      )(this.previousComparison)
    }
  );

  // These are the rankables associated with the rankings specified
  rankedRankables = computed("model.rankable.id", "model.rankables.[]", "newRankings.[]",
    function(this: BaseTasksCompareController): any {
      const rankables = get(get(this, "model"), "rankables");
      return rankables.filter((rankable: Rankable) => {
        return get(this, "newRankings").includes(rankable.id)
      });
    }
  );

  currentRankable = computed("newRankings.@each",
    function(this: BaseTasksCompareController): any {
      const otherRankables = get(this, "newRankings");
      const middleIndex = Math.floor(otherRankables.length/2);
      const tentativeCurrentRankable = otherRankables[middleIndex];
      if (!tentativeCurrentRankable) {
        return null;
      }

      return this.store.peekRecord("rankable", tentativeCurrentRankable);
    }
  );

  resetRankings(store: any, rankableGroup: RankableGroup, tentativeRankings: string[]): void {
    const rankings = get(rankableGroup, "rankings");
    tentativeRankings.forEach((value: string, index: number) => {
      if (value === rankings[index] && (tentativeRankings[index + 1] && rankings[index + 1])) {
        return;
      }

      const rankableId = tentativeRankings[index] || rankings[index]
      store.findRecord("rankable", rankableId).then((rankable: Rankable) => {
        rankable.set("rank", index + 1);
        rankable.save().then((rankable: Rankable) => {
          rankable.reload()
        });
      });
    })
  }

  actions = {
    compare(this: BaseTasksCompareController, comparison: string, currentRankable: Rankable): void {
      const rankings = get(this, "newRankings");
      const index = rankings.indexOf(currentRankable.id);
      const self = this;

      tailored.defmatch(
        tailored.clause(["lesser", { id: $ }], (currentRankableId: string) => {
          set(this, "upperBound", rankings.length);
          set(this, "lowerBound", index + 1);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "lesser");
          console.log(self);
        }),

        tailored.clause(["greater", { id: $ }], (currentRankableId: string) => {
          set(this, "upperBound", index);
          set(this, "lowerBound", 0);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "greater");
          console.log(self);
        })
      )(comparison, currentRankable)
    },

    saveComparison(this: BaseTasksCompareController, event?: MouseEvent): void {
      if (event && event.target) {
        event.preventDefault();
      }

      const tentativeRankings = get(this, "tentativeRankings");
      const model = get(this, "model");
      const rankings = get(model, "rankings");
      const rankableGroup = get(model, "rankableGroup");

      if (!tentativeRankings && rankings.length === 0) {
        const rankable = get(model, "rankable");
        rankable.set("rank", 1);
        rankable.save().then((rankable: Rankable) => {
          rankable.reload()
          rankableGroup.get("rankings").pushObject(rankable.id);
          rankableGroup.save();
        });

        this.transitionToRoute("base.tasks", rankableGroup.title);
        return;
      }

      resetRankings(this.store, tentativeRankings, rankings).then(() => {
        rankableGroup.set("rankings", tentativeRankings);
        rankableGroup.save().then((rankableGroup: RankableGroup) => {
          rankableGroup.reload();
          this.transitionToRoute("base.tasks", rankableGroup.title);
          return
        })
      });

    },

  }

}
