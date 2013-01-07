define('views/fields/string', ['views/fields/base'], function(BaseView) {

  function StringView(name, value) {
    BaseView.call(this, name, value);
    this.type = 'string';
  }

  StringView.prototype = new BaseView();

  return StringView;

});