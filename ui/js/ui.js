define('ui', ['api-client', 'manifest!', 'model'], function(api, manifest, Model) {

  var manifestMap = {};
  var dataDisplay = ko.observableArray();
  var listDisplay = ko.observableArray();
  var formDisplay = ko.observableArray();
  var listNotDisplayed = ko.observableArray();
  var formNotDisplayed = ko.observableArray();
  var currentData = ko.observableArray();
  var modelName = ko.observable();
  var visibleContext = ko.observable('default');
  var detailState = ko.observable();
  var currentStructure = ko.observable({});
  var currentManifest = ko.observable();

  function removeItem(data, e) {
    var id = e.target.parentNode.parentNode.dataset.id;
    var model = e.target.parentNode.parentNode.dataset.model;
    var item = this;
    api.remove(model, id, {
      success: function(data) {
        dataDisplay.remove(item);
      }
    });
  }

  function saveItem(e) {
    var model = e.dataset.model;
    var dd = {};
    for (var k in currentData()[0]) {
      dd[k] = currentData()[0][k].value();
    }
    if (e.dataset.id) {
      api.put(model, e.dataset.id, {
        data: dd,
        success: function(data) {
          var found = dataDisplay().filter(function(d) {return d.id.value() === e.dataset.id; })[0];
          var num = dataDisplay().indexOf(found);
          dataDisplay.splice(num, 1, new Model(data, currentStructure()));
        }
      });
    } else {
      api.create(model, {
        data: dd,
        success: function(data) {
          dataDisplay.unshift(new Model(data, currentStructure()));
//           if (!currentData().length) {
//             window.history.pushState({model: model, id: data.id}, 'Edit ' + model, [model, data.id].join('/'));
//           } else {
//             window.history.replaceState({model: model, id: data.id}, 'Edit ' + model, [data.id].join('/'));
//           }
          detailState('Edit ' + model);
        }
      });
    }
  }

  function loadItem(data, e) {
    var model = e.target.parentNode.dataset.model;
    if (model) {
      api.get(model, this.id.value(), {
        success: function(d) {
//           if (!currentData().length) {
//             window.history.pushState({model: model, id: d.id}, 'Edit ' + model, [model, d.id].join('/'));
//           } else {
//             window.history.replaceState({model: model, id: d.id}, 'Edit ' + model, [d.id].join('/'));
//           }
          detailState('Edit ' + model);
          currentData.removeAll();
          currentData.push(new Model(d, currentStructure()));
        }
      });
      return false;
    }
    return true;
  }

  function newItem(data, e) {
    var model = modelName();
    detailState('New ' + model);
//     if (!currentData().length) {
//       window.history.pushState({model: model}, 'New ' + model, [model, 'new'].join('/'));
//     } else {
//       window.history.replaceState({model: model}, 'New ' + model, ['new'].join('/'));
//     }

    currentData.removeAll();
    currentData.push(new Model({}, currentStructure()));
  }

  function loadItems(data, e) {
    var id = e.target.dataset.id;
    var model = e.target.dataset.model;
    if (id) {
      api.list(model, {
        success: function(data) {
          currentData.removeAll();
          dataDisplay.removeAll();
          detailState('');
          modelName(model);
          currentManifest(manifestMap[id]);
          currentStructure(currentManifest().structure);
          listDisplay(currentManifest().listDisplay);
          formDisplay(currentManifest().formDisplay);
          listNotDisplayed(currentManifest().listNotDisplayed());
          formNotDisplayed(currentManifest().formNotDisplayed());
          data.forEach(function(d) {
            dataDisplay.push(new Model(d, currentStructure()));
          });
          visibleContext('list');
//           window.history.pushState({model: model}, 'View ' + model, [model].join('/'));
        }
      });
    } else {
      console.log('err');
    }
  }

  function goToSwitcher() {
    window.history.back();
  }

  function extractDisplayType(st) {
    var found;
    while (!found) {
      if (st.parentNode) {
        st = st.parentNode;
        if (st.dataset.config) {
          found = st.dataset.config;
        }
      } else {
        break;
      }
    }
    return found;
  }

  for (var i = 0; i < manifest.length; i++) {
    manifestMap[manifest[i].id] = manifest[i];
  }

  ko.applyBindings({
    loadItems: loadItems,
    manifest: manifest,
    model: modelName,
    newItem: newItem,
    datum: dataDisplay,
    listDisplay: listDisplay,
    formDisplay: formDisplay,
    loadItem: loadItem,
    remove: removeItem,
    visibleContext: visibleContext,
    goToSwitcher: goToSwitcher,
    configureModel: function(data, e) {
      document.querySelector('#detail').style.display = 'none';
      document.querySelector('#configure').style.display = 'block';
    }
  }, document.querySelector('#context'));

  ko.applyBindings({
    detailState: detailState,
    model: modelName,
    datum: currentData,
    formDisplay: formDisplay,
    saveItem: saveItem,
    structure: currentStructure
  }, document.querySelector('#detail'));

  var dragSrcEl = null;
  ko.applyBindings({
    model: modelName,
    formDisplay: formDisplay,
    listDisplay: listDisplay,
    formNotDisplayed: formNotDisplayed,
    listNotDisplayed: listNotDisplayed,
    closeConfig: function() {
      document.querySelector('#detail').style.display = 'block';
      document.querySelector('#configure').style.display = 'none';
    },
    structure: currentStructure,
    listStructure: ko.computed(function() {
      var out = [];
      var s = Object.keys(currentStructure());
      for (var i = 0; i < s.length; i++) {
        if (listDisplay.indexOf(s[i]) === -1) {
          out.push(s[i]);
        }
      }
      return listDisplay().concat(out);
    }),
    formStructure: ko.computed(function() {
      var out = [];
      var s = Object.keys(currentStructure());
      for (var i = 0; i < s.length; i++) {
        if (formDisplay.indexOf(s[i]) === -1) {
          out.push(s[i]);
        }
      }
      return formDisplay().concat(out);
    }),
    structureKeys: ko.computed(function() {
      return Object.keys(currentStructure());
    }),
    isInList: function(name) {
      return listDisplay().indexOf(name) !== -1;
    },
    isInForm: function(name) {
      return formDisplay().indexOf(name) !== -1;
    },
    saveConfig: function() {
    },
    updateDisplay: function(data, e) {
      if (e.target && e.target.value) {
        var found = extractDisplayType(e.target);
        var display, notDisplayed;
        if (found === 'form') {
          display = formDisplay;
          notDisplayed = formNotDisplayed;
        } else {
          display = listDisplay;
          notDisplayed = listNotDisplayed;
        }
        if (e.target.checked) {
          if (display.indexOf(e.target.value) === -1) {
            display.push(e.target.value);
          }
        } else if (display.indexOf(e.target.value) !== -1) {
          notDisplayed.unshift(display.splice(display.indexOf(e.target.value), 1)[0]);
        }
        currentManifest().arrangeDisplay(found, display());
        currentManifest().save();
      }
      return true;
    },
    addToDisplay: function(data, e) {
      if (e.target && e.target.value) {
        var found = extractDisplayType(e.target);
        var display, notDisplayed;
        if (found === 'form') {
          display = formDisplay;
          notDisplayed = formNotDisplayed;
        } else {
          display = listDisplay;
          notDisplayed = listNotDisplayed;
        }
        if (e.target.checked) {
          if (display.indexOf(e.target.value) === -1) {
            display.push(e.target.value);
            notDisplayed.splice(notDisplayed.indexOf(e.target.value), 1);
          }
        }
        currentManifest().arrangeDisplay(found, display());
        currentManifest().save();
      }
      return true;
    },
    showConfig: function(data, e) {
      var config = e.target.dataset.config;
      if (config) {
        document.querySelector('#configure').dataset.active = config;
      }
    },
    handleDragStart: function(data, e) {
      e.dataTransfer.effectAllowed = 'move';
      dragSrcEl = e.target;
      e.target.classList.add('drag');
      return true;
    },
    handleDragEnter: function(data, e) {
      return true;
    },
    handleDragLeave: function(data, e) {
      e.target.classList.remove('over');
    },
    handleDragOver: function(data, e) {
      e.dataTransfer.dropEffect = 'move';
      e.target.classList.add('over');
      e.preventDefault();
      return true;
    },
    handleDrop: function(data, e) {
      e.stopPropagation();
      if (e.target.getAttribute('draggable')) {
        if (dragSrcEl !== e.target) {
          var insertAfter = e.target.querySelector('input[type=checkbox]').value;
        }
        dragSrcEl.classList.remove('drag');
        e.target.classList.remove('over');
        var found = extractDisplayType(e.target);
        if (found === 'form') {
          var extracted = formDisplay.splice(formDisplay.indexOf(dragSrcEl.querySelector('input[type=checkbox]').value), 1)[0];
          formDisplay.splice(formDisplay.indexOf(insertAfter)+1, 0, extracted);
          currentManifest().arrangeDisplay(found, formDisplay());
        } else {
          var extracted = listDisplay.splice(listDisplay.indexOf(dragSrcEl.querySelector('input[type=checkbox]').value), 1)[0];
          listDisplay.splice(listDisplay.indexOf(insertAfter)+1, 0, extracted);
          currentManifest().arrangeDisplay(found, listDisplay());
        }
        currentManifest().save();
      }

//       console.log(listDisplay.indexOf(e.target.querySelector('input[type=checkbox]').value));
//       console.log(listDisplay.indexOf(dragSrcEl.querySelector('input[type=checkbox]').value));
      return true;
    }
  }, document.querySelector('#configure'));

//   window.addEventListener('popstate', function(e) {
//     if (!e.state) {
//       visibleContext('default');
//       detailState('');
//       currentData.removeAll();
//     } else if (e.state.model && !e.state.id) {
//       detailState('');
//       currentData.removeAll();
//     }
//   });

});