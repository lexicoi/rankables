import Controller from "@ember/controller";
import { get } from "@ember/object";

export default Controller.extend({

  actions: {

    createRankable(rankableTitle, rankableGroup, store, event) {
      event.preventDefault();

      store.createRecord("rankable", {
        title: rankableTitle,
        rankableGroup: rankableGroup
      }).save().then((rankable) => {
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

    }

  }

});
