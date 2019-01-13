import Controller from "@ember/controller";
import { computed, get, set } from "@ember/object";
import Rankable from "compare/models/rankable";
import RankableGroup from "compare/models/rankable-group";
//@ts-ignore
import tailored from "tailored";
import produce from "immer";

const $ = tailored.variable();

export default class CategoryCompareController extends Controller {
  // Used for keeping track of what the best scenario was.
  previousCurrentRankableId: string|null = null;
  previousComparison: "lesser"|"greater"|null = null;

  newRankings = computed("model.rankings.[]", "model.rankableToCompare",
    function(this: CategoryCompareController): string[] {
      const model = get(this, "model");
      const rankableToCompare = get(model, "rankableToCompare");

      const newRankings = produce(get(model, "rankings"), draftRankings => {
        draftRankings.removeObject(rankableToCompare.id);
      });

      return newRankings;
    }
  );

  rankedRankables = computed("model.rankables.[]", "newRankings.[]",
    function(this: CategoryCompareController): any {
      const rankables = get(get(this, "model"), "rankables");
      return rankables.filter((rankable: Rankable) => {
        return get(this, "newRankings").includes(rankable.id)
      });
    }
  );

  currentRankable = computed("rankedRankables.[]",
    function(this: CategoryCompareController): any {
      const otherRankables = get(this, "rankedRankables");
      const middleIndex = Math.floor(otherRankables.length/2);
      return otherRankables[middleIndex];
    }
  );

  actions = {
    createRankable(rankableTitle: string, rankableGroup: RankableGroup, store: any, event: any) {
      event.preventDefault();

      store.createRecord("rankable", {
        title: rankableTitle,
        rankableGroup: rankableGroup
      }).save().then((rankable: Rankable) => {
        rankable.reload();
        event.target["rankable-title"].value = null;
      })
    },

    createRankableGroup(rankableGroupTitle, store, event) {
      event.preventDefault();

      store.createRecord("rankable-group", {
        title: rankableGroupTitle
      }).save().then((rankableGroup) => {
        rankableGroup.reload();
        event.target["rankable-group-title"].value = null;
      })

    },

    navigateToCompare(this: CategoryCompareController, event?: MouseEvent, title: string): void {
      this.transitionToRoute("category.compare");
    },

    compare(this: CategoryCompareController, comparison: string, currentRankable: Rankable): void {
      const rankings = get(this, "newRankings");
      const index = rankings.indexOf(currentRankable.id);

      tailored.defmatch(
        tailored.clause(["lesser", { id: $ }], (currentRankableId) => {
          const afterCompareRankings = rankings.slice(index + 1, rankings.length - 1);
          console.log(rankings);
          console.log(afterCompareRankings);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "lesser");
          set(this, "newRankings", afterCompareRankings)
        }),

        tailored.clause(["greater", { id: $ }], (currentRankableId) => {
          const afterCompareRankings = rankings.slice(0, index);
          console.log(rankings);
          console.log(afterCompareRankings);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "greater");
          set(this, "newRankings", afterCompareRankings)
        })
      )(comparison, currentRankable)
    },

    saveComparison(this: CategoryCompareController, event?: MouseEvent): void {
      tailored.defmatch(
        tailored.clause([undefined], () => { return }),
        tailored.clause([{ target: undefined }], () => { return })
      )(event);

      event.preventDefault();

      tailored.defmatch(
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
            draftRankings.insertAt(previousRankableIndex + 1, rankableToCompare.id);
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
          model: {
            rankings: { length: $ }
            rankableGroup: $,
            rankableToCompare: $,
          }
        }], (rankingLength, rankableGroup, rankableToCompare) => {
          rankableGroup.rankings.pushObject(rankableToCompare.id);
          set(rankableToCompare, "rank", 1);
          rankableToCompare.save().then(() => {
            rankableGroup.save().then(() => {
              this.transitionToRoute("category", rankableGroup.title);
            });
          });
        }, (length) => length === 0),

        tailored.clause([{
          model: { rankableGroup: { title: $ } }
        }], (rankableGroupTitle) => {
          this.transitionToRoute("category", rankableGroupTitle);
        })

      )(this.getProperties("model", "currentRankable", "previousComparison", "previousCurrentRankableId"))


      this.transitionToRoute("category.index", get(this, "model.rankableGroup").title);
    }
  }
};
