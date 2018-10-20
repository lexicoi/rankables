import Controller from "@ember/controller";

export default Controller.extend({

  actions: {

    saveAndUpdateRankable(rankable) {
      rankable.rankableGroup.reload();
    }

  }

});
