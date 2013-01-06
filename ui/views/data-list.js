define('view/model-list', function() {

  function ModelList() {
    this.manifest =
  }
  ko.applyBindings({
    loadItems: loadItems,
    manifest: data,
    model: modelName
  }, document.querySelector('#model-list'));

});