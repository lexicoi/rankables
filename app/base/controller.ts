import Controller from "@ember/controller";
import RankableGroup from "compare/models/rankable-group";
import Rankable from "compare/models/rankable";

export default class BaseController extends Controller {

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

      createRankableGroup(rankableGroupTitle: string, store: any, event: any) {
        event.preventDefault();

        store.createRecord("rankable-group", {
          title: rankableGroupTitle
        }).save().then((rankableGroup: RankableGroup) => {
          rankableGroup.reload();
          event.target["rankable-group-title"].value = null;
        })

      }

  }
}
