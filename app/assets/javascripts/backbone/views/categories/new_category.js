if (!window.Categories) window.Categories = {};

window.Categories.NewView = Backbone.View.extend({
	template: JST["backbone/templates/categories/new"],
	
	events: {
		"submit #new-category" : "newCategory"
	},
	
	initialize: function() {
		this.model = new this.collection.model();
	},
	
	newCategory: function(event) {
		event.preventDefault();
		event.stopPropagation();
		
		this.collection.create(this.model.toJSON(), {
			success: function(model, response) {
				this.collection.trigger("serverCreated", model.set("id", response.success.id));
			}.bind(this),
			
			error: function(model, reponse) {
				console.log("ERROR");
			},
			
			silent: true
		});
	},
	
	render: function() {
		$(this.el).html(this.template);
		$(this.el).find("form").backboneLink(this.model);
		return this;
	}
});