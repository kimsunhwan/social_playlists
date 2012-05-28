window.CategoryModel = Backbone.Model.extend({
	defaults: {
		name: null
	}
});

window.CategoryCollection = Backbone.Collection.extend({
	model: CategoryModel,
	url: "/category"
});