import Rankable from "rankables/models/rankable";
import Ember from "ember";

export function resetRankings(store: any, tentativeRankings: string[], rankings: string[]): Promise<any> {
  let promises: any = [];

  tentativeRankings.forEach((value: string, index: number) => {
    const currentRankable = store.queryRecord("rankable", value);

    if (value === rankings[index] &&
      (tentativeRankings[index + 1] &&
        rankings[index + 1]) &&
      currentRankable.rank === index + 1 // Needed if #1 ranked item is deleted
    ) {
      return;
    }

    const rankableId = tentativeRankings[index] || rankings[index]
    store.findRecord("rankable", rankableId).then((rankable: Rankable) => {
      rankable.set("rank", index + 1);
      promises.pushObject(rankable.save());
    });
  })

  return Ember.RSVP.all(promises);
}
