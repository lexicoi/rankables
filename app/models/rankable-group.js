import { Model } from "ember-pouch";
import DS from "ember-data";

export default Model.extend({
  title: DS.attr("string"),
  rankables: DS.hasMany("rankable"),
  rankings: DS.attr({ defaultValue: function() { return []; } })
});
