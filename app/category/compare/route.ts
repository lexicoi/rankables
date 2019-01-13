import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import { get, set } from "@ember/object";
import tailored from "tailored";
import produce from "immer";

const $ = tailored.variable();
const _ = tailored.wildcard();

const resetRankings = function({rankableToCompare, rankings, controller}) {
  const newRankings = produce(rankings, draftRankings => {
    draftRankings.removeObject(rankableToCompare.id);
  });

  return newRankings;
};

export default Route.extend({

  queryParams: {
    "rankable-id": {
      refreshModel: true
    }
  },

  store: service(),

  model(params) {
    const rankableToCompare = tailored.defmatch(
      tailored.clause([{
        store: $,
        params: { "rankable-id": $ }
      }], (store: any, rankableId: string) => {
        return store.findRecord("rankable", rankableId);
      }, (store: any, rankableId: string) => Boolean(rankableId)),

      tailored.clause([{
        store: $,
        rankableGroup: { id: $ }
      }], (store: any, rankableGroupId: string) => {
        return store.queryRecord("rankable", {
          filter: {
            rankableGroup: rankableGroupId,
            rank: 0
          }
        });
      })
    );

    const rankableGroupTitle = this.paramsFor("category")["rankable-group-title"];
    return Ember.RSVP.hash({
      params: params,
      rankableGroup: get(this, "store").queryRecord("rankable-group",  {
        filter: { title: rankableGroupTitle }
      })
    }).then(({params, rankableGroup}) => {
      return Ember.RSVP.hash({
        rankables: rankableGroup.rankables,
        rankableToCompare: rankableToCompare({
          params: params
          store: get(this, "store"),
          rankableGroup: rankableGroup
        }),

        rankings: rankableGroup.rankings,
        rankableGroup: rankableGroup,
        rankableGroups: get(this, "store").findAll("rankable-group")
      })
    })
  },

  afterModel(model) {
    this._super(...arguments);

    tailored.defmatch(
      tailored.clause([{
        rankableToCompare: null,
        rankableGroup: { title: $ }
      }], (rankableGroupTitle) => {
        // TODO: Navigate to an error page or similar
        this.transitionTo("category", rankableGroupTitle);
      }),

      tailored.clause([{
        rankables: { length: $ },
        rankableToCompare: { id: $ },
        rankableGroup: { title: $ }
      }], (rankablesLength, rankableToCompareId, rankableGroupTitle) => {
        let queryParams = { "rankable-id": rankableToCompareId };
        this.transitionTo("category.compare", rankableGroupTitle, { queryParams: queryParams });
      }, (length => length > 0)),
    )(model)
  },

  setupController(controller, model) {
    this._super(...arguments);

    set(controller, "newRankings", resetRankings({
      rankableToCompare: model.rankableToCompare,
      rankings: model.rankings,
      controller: controller
    }))
  }

});
