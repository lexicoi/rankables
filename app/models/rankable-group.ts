import DS from "ember-data";

export default class RankableGroup extends DS.Model.extend({
  title: DS.attr("string"),
  rankables: DS.hasMany("rankable"),
  rankings: DS.attr({ defaultValue: function() { return []; } }),
  rev: DS.attr("string")
}) {};


declare module "ember-data" {
  interface ModelRegistry {
    rankableGroup: RankableGroup
  }
}
