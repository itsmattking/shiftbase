define('views/fields/base', function() {

  function BaseView(name, value) {
    if (typeof name !== 'undefined' && typeof value !== 'undefined') {
      this.name = ko.observable(name);
      this.value = ko.observable(value);
    }
    this.type = 'base';
  }

  return BaseView;

});