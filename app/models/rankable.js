import DS from "ember-data";
import { Model } from "ember-pouch";

export default Model.extend({
  title: DS.attr("string"),
  description: DS.attr("string"),
  rankables: DS.hasMany("rankable"),
  rankableGroup: DS.belongsTo("rankable-group"),
  rank: DS.attr("number", { defaultValue: 0 }),
  rankings: DS.attr({ defaultValue: function() { return [] } }),
  parent: DS.belongsTo("rankable")
});
