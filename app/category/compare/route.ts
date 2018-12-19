import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import { get, set } from "@ember/object";
import tailored from "tailored";

const $ = tailored.variable();

export default Route.extend({

  queryParams: {
    "rankable-id": {
      refreshModel: true
    }
  },

  store: service(),

  model(params) {
    set(this, "params", params);

    const rankableToCompare = tailored.defmatch(
      tailored.clause([{ "rankable-id": $ }], (rankableId) => {
        return store.findRecord("rankable", params["rankable-id"]);
      })

      tailored.clause([_], () => {
        return store.queryRecord("rankable", {
          filter: {
            rankableGroup: rankableGroup.id,
            rank: 0
          }
        });
      })
    );


    const rankableGroupTitle = this.paramsFor("category")["rankable-group-title"];
    return get(this, "store").queryRecord("rankable-group",  {
      filter: { title: rankableGroupTitle }
    }).then((rankableGroup) => {
      return Ember.RSVP.hash({
        rankables: rankableGroup.rankables,
        rankableToCompare: rankableToCompare(get(this, "store"), rankableGroup),
        rankings: rankableGroup.rankings,
        rankableGroup: rankableGroup,
        rankableGroups: get(this, "store").findAll("rankable-group")
      })
    })
  },

  afterModel(model) {
    let queryParams = get(this, "params");
    const rankableGroup = model.rankableGroup;

    if (!queryParams["rankable-id"] && model.rankables.length !== 0) {
      queryParams = { "rankable-id": model.rankableToCompare.id };
      this.transitionTo("category.compare", rankableGroup.title, { queryParams: queryParams });
    }
  }

});
