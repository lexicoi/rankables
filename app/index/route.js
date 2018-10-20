import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import { get } from "@ember/object";

export default Route.extend({

  store: service(),

  model() {
    return get(this, "store").findAll("rankable-group").then((data) => {
      if (data.length == 0) {
        return get(this, "store").createRecord("rankable-group", {
          title: "General"
        }).save();
      } else {
        // The first rankableGroup will always be 'general'
        return get(this, "store").findRecord("rankable-group", data.content[0].id);
      }
    })
  }

});
