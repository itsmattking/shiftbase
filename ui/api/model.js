define('api/model', function() {

  function Model(name, fields) {
    this.name = name;
    this.fields = fields.filter(function(f) {
      return f !== 'id';
    });
  }

  return Model;

});