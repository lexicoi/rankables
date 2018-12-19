import Controller from "@ember/controller";
import { computed, get, set } from "@ember/object";
import Rankable from "compare/models/rankable";
import tailored from "tailored";
import produce from "immer";

const $ = tailored.variable();

export default class CategoryCompareController extends Controller {
  constructor() {
    set(this, "newRankings", null);
    set(this, "rankedRankables", null);
    set(this, "currentRankable", null);
  }

  queryParams = ["rankable"];

  newRankings = computed("model.rankings",
    function(this: CategoryCompareController): string[] {
      const model = get(this, "model");
      const rankableToCompare = get(model, "rankableToCompare");

      const newRankings = produce(get(model, "rankings"),  draftRankings => {
        draftRankings.removeObject(rankableToCompare.id);
      });

      return newRankings;
    }
  );

  rankedRankables = computed("model.rankables", "newRankings",
    function(this: CategoryCompareController): any {
      const rankables = get(this, "model.rankables");
      return rankables.filter((rankable: Rankable) => {
        return get(this, "newRankings").includes(rankable.id)
      });
    }
  );

  currentRankable = computed("rankedRankables.@each",
    function(this: CategoryCompareController): any {
      const otherRankables = get(this, "rankedRankables");
      const middleIndex = Math.floor(otherRankables.length/2);
      return otherRankables[middleIndex];
    }
  );

  // Used for keeping track of what the best scenario was.
  previousCurrentRankableId: string|null = null;
  previousComparison: "lesser"|"greater"|null = null;

  actions = {

    compareLesser(this: CategoryCompareController, currentRankableId: string): void {
      tailored.defmatch(
        tailored.clause([$], (currentRankableId) => {
          const rankings = get(this, "newRankings");
          const index = rankings.indexOf(currentRankableId);
          const afterCompareRankings = rankings.slice(index + 1, rankings.length - 1);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "lesser");
          set(this, "newRankings", afterCompareRankings)
        }, (currentRankableId) => Boolean(currentRankableId))
      )(currentRankableId);
   },

    compareGreater(this: CategoryCompareController, currentRankableId: string): void {
      tailored.defmatch(
        tailored.clause([$], (currentRankableId: string) => {
          const rankings = get(this, "newRankings");
          const index = rankings.indexOf(currentRankableId);
          const afterCompareRankings = rankings.slice(0, index);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "greater");
          set(this, "newRankings", afterCompareRankings)
        }, (currentRankableId) => Boolean(currentRankableId))
      )(currentRankableId);
    },

    saveComparison(this: CategoryCompareController, event?: MouseEvent): void {
      tailored.defmatch(
        tailored.clause([undefined], () => { return }),
        tailored.clause([{ target: undefined }], () => { return })
      )(event);

      event.preventDefault();

      tailored.defmatch(
        tailored.clause([{
          model: {
            ranking: { length: $ }
            rankableGroup: $,
            rankableToCompare: $,
          }
        }], (rankableGroup, rankableToCompare, rankingLength) => {
          rankableGroup.rankings.pushObject(rankableToCompare.id);
          set(rankableToCompare, "rank", 1);
          rankableToCompare.save().then(() => {
            rankableGroup.save().then(() => {
              this.transitionToRoute("category", rankableGroup.title);
            });
          });
        }, (length) => length === 0),

        tailored.clause([{
          currentRankable: undefined,
          previousComparison: "lesser",
          previousCurrentRankableId: $,
          model: {
            rankings: $,
            rankableGroup: $,
            rankableToCompare: $
          }
        }], (previousCurrentRankableId, rankings, rankableGroup, rankableToCompare) => {
          let previousRankableIndex = rankings.indexOf(previousCurrentRankableId);
          const newRankings = produce(rankings, draftRankings => {
            draftRankings.removeObject(previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex, rankableToCompare.id);
            draftRankings.insertAt(previousRankableIndex + 1, previousCurrentRankableId);
          });

          const rankableToCompareNewRanking = newRankings.indexOf(rankableToCompare.id);
          set(rankableGroup, "rankings", newRankings);

          tailored.defmatch(
            tailored.clause([$], ({newRankings, rankings}) => {
              newRankings.forEach((value, index) => {
                if (newRankings[index] === rankings[index]) {
                  return;
                }

                const rankableId = newRankings[index] || rankings[index]
                this.store.findRecord("rankable", rankableId).then((rankable) => {
                  rankable.set("rank", index + 1);
                  rankable.save();
                });
              })
            })
          )({ newRankings, rankings })

          rankableGroup.save();

        }),

        tailored.clause([{
          currentRankable: undefined,
          previousComparison: "greater",
          previousCurrentRankableId: $,
          model: {
            rankings: $,
            rankableGroup: $,
            rankableToCompare: $
          }
        }], (previousCurrentRankableId, rankings, rankableGroup, rankableToCompare) => {
          let previousRankableIndex = rankings.indexOf(previousCurrentRankableId);
          const newRankings = produce(rankings, draftRankings => {
            draftRankings.removeObject(previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex, previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex + 1, rankableToCompareId);
          });

          const rankableToCompareNewRanking = newRankings.indexOf(rankableToCompare.id);
          set(rankableGroup, "rankings", newRankings);

          tailored.defmatch(
            tailored.clause([$], ({newRankings, rankings}) => {
              newRankings.forEach((value, index) => {
                if (newRankings[index] === rankings[index]) {
                  return;
                }

                const rankableId = newRankings[index] || rankings[index]
                this.store.findRecord("rankable", rankableId).then((rankable) => {
                  rankable.set("rank", index + 1);
                  rankable.save();
                });
              })
            })
          )({ newRankings, rankings })

          rankableGroup.save();

        })

      )(this.getProperties("model", "currentRankable", "previousComparison", "previousCurrentRankableId"))


      this.transitionToRoute("category.index", get(this, "model.rankableGroup").title);
    }
  }
};
