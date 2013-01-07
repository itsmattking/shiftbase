define('model', ['views/fields'], function(fields) {

  function Model(data, structure) {
    for (var k in structure) {
    if (!(k in data)) {
      console.log('no data for ' + k);
      console.log(data);
    }
      this[k] = new fields[structure[k]](k, data[k]);
    }
  }

  return Model;

});