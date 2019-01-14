import Controller from "@ember/controller";
import Rankable from "compare/models/rankable";
import RankableGroup from "compare/models/rankable-group";
import { computed, get, set } from "@ember/object";
import produce from "immer";
//@ts-ignore
import tailored from "tailored";

export default class BaseTasksCompareController extends Controller {

  previousCurrentRankableId: string =  null;
  previousComparison: string = null;

  // These are the rankings when not taking into account the item currently being compared (in the
  // URL)
  newRankings = computed("model.rankings.[]", "model.rankable",
    function(this: BaseTasksCompareController): string[] {
      const model = get(this, "model");
      const rankableToCompare = get(model, "rankable");

      const newRankings = produce(get(model, "rankings"), draftRankings => {
        draftRankings.removeObject(rankableToCompare.id);
      });

      return newRankings;
    }
  );

  // These are the rankables associated with the rankings specified
  rankedRankables = computed("model.rankables.[]", "newRankings.[]",
    function(this: BaseTasksCompareController): any {
      const rankables = get(get(this, "model"), "rankables");
      return rankables.filter((rankable: Rankable) => {
        return get(this, "newRankings").includes(rankable.id)
      });
    }
  );

  currentRankable = computed("rankedRankables.[]",
    function(this: BaseTasksCompareController): any {
      const otherRankables = get(this, "rankedRankables");
      const middleIndex = Math.floor(otherRankables.length/2);
      return otherRankables[middleIndex];
    }
  );

  actions = {
    compare(this: BaseTasksCompareController, comparison: string, currentRankable: Rankable): void {
      const rankings = get(this, "newRankings");
      const index = rankings.indexOf(currentRankable.id);

      tailored.defmatch(
        tailored.clause(["lesser", { id: $ }], (currentRankableId: string) => {
          const afterCompareRankings = rankings.slice(index + 1, rankings.length - 1);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "lesser");
          set(this, "newRankings", afterCompareRankings)
        }),

        tailored.clause(["greater", { id: $ }], (currentRankableId: string) => {
          const afterCompareRankings = rankings.slice(0, index);
          set(this, "previousCurrentRankableId", currentRankableId);
          set(this, "previousComparison", "greater");
          set(this, "newRankings", afterCompareRankings)
        })
      )(comparison, currentRankable)
    },

    saveComparison(this: BaseTasksCompareController, event?: MouseEvent): void {
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
        }], (previousCurrentRankableId: string, rankings: string[], rankableGroup: RankableGroup, rankableToCompare: Rankable) => {
          let previousRankableIndex = rankings.indexOf(previousCurrentRankableId);
          const newRankings = produce(rankings, draftRankings => {
            draftRankings.removeObject(previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex, rankableToCompare.id);
            draftRankings.insertAt(previousRankableIndex + 1, previousCurrentRankableId);
          });

          set(rankableGroup, "rankings", newRankings);

          tailored.defmatch(
            tailored.clause([$], ({ newRankings, rankings }: { newRankings: string[], rankings: string[] }) => {
              newRankings.forEach((value, index) => {
                if (value === rankings[index]) {
                  return;
                }

                const rankableId = newRankings[index] || rankings[index]
                this.store.findRecord("rankable", rankableId).then((rankable: Rankable) => {
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
        }], (previousCurrentRankableId: string, rankings: string[], rankableGroup: RankableGroup, rankableToCompare: Rankable) => {
          let previousRankableIndex = rankings.indexOf(previousCurrentRankableId);
          const newRankings = produce(rankings, draftRankings => {
            draftRankings.removeObject(previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex, previousCurrentRankableId);
            draftRankings.insertAt(previousRankableIndex + 1, rankableToCompare.id);
          });

          set(rankableGroup, "rankings", newRankings);

          tailored.defmatch(
            tailored.clause([$], ({newRankings, rankings}: { newRankings: string[], rankings: string[] }) => {
              newRankings.forEach((value, index) => {
                if (value === rankings[index]) {
                  return;
                }

                const rankableId = newRankings[index] || rankings[index]
                this.store.findRecord("rankable", rankableId).then((rankable: Rankable) => {
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
            rankableGroup: $,
            rankableToCompare: $,
          }
        }], (rankableGroup: RankableGroup, rankableToCompare: Rankable) => {
          rankableGroup.get("rankings").pushObject(rankableToCompare.id);
          set(rankableToCompare, "rank", 1);
          rankableToCompare.save().then(() => {
            rankableGroup.save().then(() => {
              this.transitionToRoute("category", rankableGroup.title);
            });
          });
        }, (length: number) => length === 0),

        tailored.clause([{
          model: { rankableGroup: { title: $ } }
        }], (rankableGroupTitle: string) => {
          this.transitionToRoute("category", rankableGroupTitle);
        })

      )(this.getProperties("model", "currentRankable", "previousComparison", "previousCurrentRankableId"))


      this.transitionToRoute("base.tasks", get(this, "model").get("rankableGroup").title);
    }
  }

}
