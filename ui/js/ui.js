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
    var item = this;
    item.remove(function(data) {
      dataDisplay.remove(item);
    });
  }

  function saveItem(e) {
    var model = e.dataset.model;
    if (e.dataset.id) {
      currentData()[0].save(function(data) {
        var found = dataDisplay().filter(function(d) {
          return d.fields.id.value() === e.dataset.id;
        })[0];
        var num = dataDisplay().indexOf(found);
        dataDisplay.splice(num, 1, currentData()[0]);
      });
    } else {
      currentData()[0].create(function() {
        dataDisplay.unshift(currentData()[0]);
        detailState('Edit ' + model);
      });
    }
  }

  function loadItem(data, e) {
    var model = e.target.parentNode.dataset.model;
    if (model) {
      document.querySelector('#detail').style.display = 'block';
      document.querySelector('#configure').style.display = 'none';
      api.get(model, this.fields.id.value(), {
        success: function(d) {
//           if (!currentData().length) {
//             window.history.pushState({model: model, id: d.id}, 'Edit ' + model, [model, d.id].join('/'));
//           } else {
//             window.history.replaceState({model: model, id: d.id}, 'Edit ' + model, [d.id].join('/'));
//           }
          detailState('Edit ' + model);
          currentData.removeAll();
          currentData.push(new Model(model, d, currentStructure()));
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
    currentData.push(new Model(model, {}, currentStructure()));
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
            dataDisplay.push(new Model(model, d, currentStructure()));
          });
          visibleContext('list');
//           window.history.pushState({model: model}, 'View ' + model, [model].join('/'));
        }
      });
    } else {
      console.log('err');
    }
  }

  function goToSwitcher(data, e) {
//     window.history.back();
    visibleContext('switcher');
  }

  function saveField(data, e) {
    console.log(e);
  }

  function addField(data, e) {
    var type = document.querySelector('select[name=fieldTypes]').value;
    formDisplay.push('Name This Field');
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

  var fieldOptions = [
    {
      name: 'Text Field',
      value: 'string'
    },
    {
      name: 'Text Area',
      value: 'text'
    },
    {
      name: 'Yes/No',
      value: 'boolean'
    },
    {
      name: 'Date',
      value: 'date'
    },
    {
      name: 'Choice',
      value: 'choice'
    },
    {
      name: 'Image',
      value: 'image'
    }
  ];

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
    isActive: function(item) {
      return currentData().length &&
        currentData()[0].fields.id.value() === item.fields.id.value();
    },
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
    saveField: saveField,
    addField: addField,
    fieldOptions: fieldOptions,
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
    resetDrag: function(e) {
      if (dragSrcEl) {
        dragSrcEl.parentNode.querySelector('li').map(function(l) {
          l.classList.remove('over');
        });
      }
    },
    handleMouseDown: function(data, e) {
      if (e.target.classList.contains('handle')) {
        return true;
      } else {
        return false;
      }
    },
    handleDragStart: function(data, e) {
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('drag');
      dragSrcEl = e.target;
      return true;
    },
    handleDragEnter: function(data, e) {
      return true;
    },
    handleDragLeave: function(data, e) {
      var lis = Array.prototype.slice.call(document.querySelectorAll('[data-config] ul li[draggable]'), 0);
      lis.map(function(l) {
        l.classList.remove('over');
      });
    },
    handleDragEnd: function(data, e) {
      var lis = Array.prototype.slice.call(document.querySelectorAll('[data-config] ul li[draggable]'), 0);
      lis.map(function(l) {
        l.classList.remove('over');
      });
      dragSrcEl.classList.remove('drag');
      dragSrcEl = null;
    },
    handleDragOver: function(data, e) {
      e.dataTransfer.dropEffect = 'move';
      var target = e.target;
      while (target && !target.getAttribute('draggable')) {
        target = target.parentNode;
      }
      if (target !== dragSrcEl) {
        target.classList.add('over');
      }
      e.preventDefault();
      return true;
    },
    handleDrop: function(data, e) {
      e.stopPropagation();
      var target = e.target;
      while (target && !target.getAttribute('draggable')) {
        target = target.parentNode;
      }
      if (dragSrcEl === target) {
        dragSrcEl.classList.remove('drag');
        target.classList.remove('over');
        return true;
      }
      if (dragSrcEl !== target) {
        var insertAfter = target.querySelector('input[type=checkbox]').value;
      }
      dragSrcEl.classList.remove('drag');
      target.classList.remove('over');
      var found = extractDisplayType(target);
      if (found === 'form') {
        formDisplay.splice(formDisplay.indexOf(insertAfter), 0,
                           formDisplay.splice(formDisplay.indexOf(dragSrcEl.querySelector('input[type=checkbox]').value), 1)[0]);
        currentManifest().arrangeDisplay(found, formDisplay());
      } else {
        listDisplay.splice(listDisplay.indexOf(insertAfter), 0,
                           listDisplay.splice(listDisplay.indexOf(dragSrcEl.querySelector('input[type=checkbox]').value), 1)[0]);
        currentManifest().arrangeDisplay(found, listDisplay());
      }
      currentManifest().save();

      return true;
    }
  }, document.querySelector('#configure'));

  function handleResize(e) {
    var h = window.innerHeight;
    document.querySelector('#switcher').style.height = h + 'px';
    document.querySelector('#list').style.height = h + 'px';
    document.querySelector('#list #data-table').style.height = (h-document.querySelector('#list h2').offsetHeight) + 'px';
    document.querySelector('#detail').style.height = h + 'px';
  }

  window.addEventListener('resize', handleResize);
  handleResize();

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
  setTimeout(function() {
    document.body.classList.add('animate');
  });

});