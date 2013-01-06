define('views/model-list', ['api-client'], function(api) {

  function ModelList(manifest) {
    this.manifest = manifest;
    this.fields = ko.observableArray();
    this.selectedModel = ko.observable();
  }

  ModelList.prototype.loadItems = function(data, e) {
    var id = e.target.dataset.id;
    var model = e.target.dataset.model;
    if (id) {
      this.selectedModel(model);
      this.fields.removeAll();
      var keys = Object.keys(this.manifest[id].structure);
      for (var i = 0; i < keys.length; i++) {
        this.fields.push(keys[i]);
      };
      api.get({
        url: 'http://127.0.0.1:9000/api/' + model,
        success: function(data) {
          data.forEach(function(d) {
            dataDisplay.push(d);
          });
        }
      });
    } else {
      console.log('err');
    }
  };

  ko.applyBindings({
    loadItems: loadItems,
    manifest: data,
    model: modelName
  }, document.querySelector('#model-list'));

});