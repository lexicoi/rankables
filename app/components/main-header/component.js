import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";

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
        rankable.reload();
        event.target["rankable-title"].value = null;
      })

    }

  }

});
