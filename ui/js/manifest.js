define('manifest', ['api-client'], function(api) {

  function Manifest(options) {
    for (var k in options) {
      this[k] = options[k];
    }
  }

  Manifest.prototype.arrangeDisplay = function(type, order) {
    for (var i = 0; i < order.length; i++) {
      if (this[type + 'Display'].indexOf(order[i]) === -1) {
        order.splice(i, 1);
      }
    }
    this[type + 'Display'] = order;
  };

  Manifest.prototype.save = function() {
    api.put('manifest', this.id, {
      data: this.toJSON(),
      success: function() {
      }
    });
  };

  Manifest.prototype.toJSON = function() {
    return {
      listDisplay: this.listDisplay,
      formDisplay: this.formDisplay,
      structure: this.structure,
      model: this.model
    };
  };

  Manifest.prototype.listNotDisplayed = function() {
    var out = [];
    var allFields = Object.keys(this.structure);
    for (var i = 0; i < allFields.length; i++) {
      if (this.listDisplay.indexOf(allFields[i]) === -1) {
        out.push(allFields[i]);
      }
    }
    return out;
  };

  Manifest.prototype.formNotDisplayed = function() {
    var out = [];
    var allFields = Object.keys(this.structure);
    for (var i = 0; i < allFields.length; i++) {
      if (this.formDisplay.indexOf(allFields[i]) === -1) {
        out.push(allFields[i]);
      }
    }
    return out;
  };

  return {
    load: function(name, req, onLoad, config) {
      api.list('manifest', {
        success: function(data) {
          var out = [];
          for (var i = 0; i < data.length; i++) {
            out.push(new Manifest(data[i]));
          }
          onLoad(out);
        }
      });
    }
  };

});