import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route("signup");
  this.route("login");
  this.route("category", { path: "/categories/:rankable-group-title" }, function() {
    this.route("compare");
  })
  this.route("task", { path: "/tasks/:rankable-id" }, function() {
    this.route("compare");
  });
  this.route("tasks");

  this.route("base", { path: "/" }, function() {
    this.route("tasks", { path: "/:rankable-group-title" }, function() {
      this.route("task", { path: "/:rankable-id" })
      this.route("compare", { path: "/:rankable-id/compare" });
    });
  });
});

export default Router;
