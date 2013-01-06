define('manifest', ['api-client'], function(api) {

  function Manifest(options) {
    for (var k in options) {
      this[k] = options[k];
    }
  }

  Manifest.prototype.arrangeListDisplay = function(order) {
    for (var i = 0; i < order.length; i++) {
      if (this.listDisplay.indexOf(order[i]) === -1) {
        order.splice(i, 1);
      }
    }
    this.listDisplay = order;
  };

  Manifest.prototype.arrangeFormDisplay = function(order) {
    for (var i = 0; i < order.length; i++) {
      if (this.formDisplay.indexOf(order[i]) === -1) {
        order.splice(i, 1);
      }
    }
    this.formDisplay = order;
  };

  Manifest.prototype.save = function() {
    api.put('manifest', this.id, {
      data: this.toJSON(),
      success: function() {
        console.log('saved');
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