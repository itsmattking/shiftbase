define('views/fields/base', function() {

  function BaseView(name, value) {
    this.name = ko.observable(name);
    this.value = ko.observable(value);
    this.type = 'base';
  }

  return BaseView;

});