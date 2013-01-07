define('ui', ['api-client', 'manifest!', 'model'], function(api, manifest, Model) {

  var manifestMap = {};
  var dataDisplay = ko.observableArray();
  var listDisplay = ko.observableArray();
  var formDisplay = ko.observableArray();
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
    console.log(dd);
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
        data: currentData()[0],
        success: function(data) {
          dataDisplay.unshift(data);
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
    closeConfig: function() {
      document.querySelector('#detail').style.display = 'block';
      document.querySelector('#configure').style.display = 'none';
    },
    structure: currentStructure,
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
    updateListDisplay: function(data, e) {
      if (e.target && e.target.value) {
        if (e.target.checked) {
          if (listDisplay.indexOf(e.target.value) === -1) {
            listDisplay.unshift(e.target.value);
          }
        } else if (listDisplay.indexOf(e.target.value) !== -1) {
          listDisplay.splice(listDisplay.indexOf(e.target.value), 1);
        }
        currentManifest().arrangeListDisplay(listDisplay());
        currentManifest().save();
      }
      return true;
    },
    updateFormDisplay: function(data, e) {
      if (e.target && e.target.value) {
        if (e.target.checked) {
          if (formDisplay.indexOf(e.target.value) === -1) {
            formDisplay.unshift(e.target.value);
          }
        } else if (formDisplay.indexOf(e.target.value) !== -1) {
          formDisplay.splice(formDisplay.indexOf(e.target.value), 1);
        }
        currentManifest().arrangeFormDisplay(formDisplay());
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
          dragSrcEl.parentNode.removeChild(dragSrcEl);
          e.target.parentNode.insertBefore(dragSrcEl, e.target.nextSibling);
        }
        dragSrcEl.classList.remove('drag');
        e.target.classList.remove('over');
        var st = e.target;
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
        var n = e.target.parentNode.querySelectorAll('li');
        var out = [];
        for (var i = 0; i < n.length; i++) {
          if (n[i].querySelector('input[type=checkbox]').checked) {
            out.push(n[i].querySelector('input[type=checkbox]').value);
          }
        }
        if (found === 'form') {
          formDisplay(out);
          currentManifest().arrangeFormDisplay(formDisplay());
        } else {
          listDisplay(out);
          currentManifest().arrangeListDisplay(listDisplay());
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