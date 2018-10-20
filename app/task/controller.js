import Controller from "@ember/controller";
import { get } from "@ember/object";

export default Controller.extend({

  actions: {
    saveModel(attribute, event) {
      const value = event.target.value;
      let rankable = get(this, "model");
      rankable.set(attribute, value);
      rankable.save();
    }
  }

});
