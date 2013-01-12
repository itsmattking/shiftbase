define('model', ['api-client', 'views/fields'], function(api, fields) {

  function Model(name, data, structure) {
    this.name = name;
    this.structure = structure;
    this.fields = {};
    for (var k in structure) {
      this.fields[k] = new fields[structure[k]](k, data[k]);
    }
  }

  Model.prototype.save = function(callback) {
    api.put(this.name, this.fields.id.value(), {
      data: this.toJSON(),
      success: callback
    });
  };

  Model.prototype.remove = function(callback) {
    api.remove(this.name, this.fields.id.value(), {
      success: callback
    });
  };

  Model.prototype.create = function(callback) {
    api.create(this.name, {
      data: this.toJSON(),
      success: function(data) {
        this.fields.id.value(data.id);
        callback(data);
      }.bind(this)
    });
  };

  Model.prototype.toJSON = function() {
    var out = {};
    for (var k in this.structure) {
      out[k] = this.fields[k].value();
    }
    return out;
  };

  return Model;

});