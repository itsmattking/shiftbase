define('views/fields/text', ['views/fields/base'], function(BaseView) {

  function TextView(name, value) {
    BaseView.call(this, name, value);
    this.type = 'text';
  }

  TextView.prototype = new BaseView();

  return TextView;

});