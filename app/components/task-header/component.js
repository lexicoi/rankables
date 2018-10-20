import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default Component.extend({

  store: service(),

  actions: {

    createRankable(event) {
      event.preventDefault();
      const rankableTitle = event.target["rankable-title"].value;

      this.get("store").createRecord("rankable", {
        title: rankableTitle,
        rankableGroup: get(this, "rankableGroup")
      }).save().then((rankable) => {
        event.target["rankable-title"].value = null;
        this.saveAndUpdateRankable(rankable);
      })

    }
  }

});
