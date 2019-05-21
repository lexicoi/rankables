import Controller from "@ember/controller";
import RankableGroup from "rankables/models/rankable-group";

export default class BaseController extends Controller {

  expandGroups = false;

  actions = {

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
