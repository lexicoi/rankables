import DS from "ember-data";

export default class Rankable extends DS.Model.extend({
  title: DS.attr("string"),
  description: DS.attr("string"),
  rankables: DS.hasMany("rankable"),
  rankableGroup: DS.belongsTo("rankable-group"),
  rank: DS.attr("number", { defaultValue: 0 }),
  rankings: DS.attr({ defaultValue: function() { return [] } }),
  rev: DS.attr("string")
}) {};

declare module "ember-data" {
  interface ModelRegistry {
    rankable: Rankable
  }
}
