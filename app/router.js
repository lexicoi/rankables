import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route("signup");
  this.route("login");
  this.route("category", { path: "/categories/:rankable_group_title" }, function() {
    this.route("compare");
  })
  this.route("task", { path: "/tasks/:rankable_id" }, function() {
    this.route("compare");
  });
  this.route("tasks");
});

export default Router;
