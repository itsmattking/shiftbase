define('views/fields/boolean', ['views/fields/base'], function(BaseView) {

  function BooleanView(name, value) {
    this.type = 'boolean';
    this.name = ko.observable(name);
    this.boolValue = ko.observable(value);
    this.isChecked = ko.computed(function() {
      return this.value();
    }, this);
    this.value = ko.computed({
      read: function() {
        return typeof this.boolValue() !== 'undefined' ?
          this.boolValue().toString() :
          'true';
      },
      write: function(val) {
        if (typeof val === 'string') {
          if (val === 'true') {
            this.boolValue(true);
          } else if (val === 'false') {
            this.boolValue(false);
          }
        } else if (typeof val === 'number') {
          if (val === 1) {
            this.boolValue(true);
          } else if (val === 0) {
            this.boolValue(false);
          }
        } else {
          this.boolValue(val);
        }
      },
      owner: this
    }, this);
  }

  BooleanView.prototype = new BaseView();

  return BooleanView;

});