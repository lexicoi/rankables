import Controller from "@ember/controller";

export default Controller.extend({

  actions: {
    createRankableGroup(event) {
      event.preventDefault();
      const rankableGroupTitle = event.target["rankable-group-title"].value;

      this.get("store").createRecord("rankable-group", {
        title: rankableGroupTitle
      }).save().then((rankableGroup) => {
        rankableGroup.reload();
        event.target["rankable-group-title"].value = null;
      })

    }

  }

});
