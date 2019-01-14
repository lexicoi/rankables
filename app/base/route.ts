import Route from "@ember/routing/route";
import { get } from "@ember/object";

export default class BaseRoute extends Route {

  model() {
    return get(this, "store").findAll("rankable-group").then((data) => {
      if (data.length == 0) {
        get(this, "store").createRecord("rankable-group", {
          title: "General"
        }).save();
      }

      return data;
    })
  }
};
