package controllers

import (
	"fmt"
	"log"
	"net/http"
	"code.google.com/p/goweb/goweb"
	"github.com/couchbaselabs/go-couchbase"
	"github.com/nu7hatch/gouuid"
)

const allMapFunc = "function (doc, meta){\n  if (!doc.isManifest && doc.model === '%s') {\n    emit(meta.id, doc.data);\n  }\n}"
const allReduceFunc = "function (keys, values){\n  return values;\n}"

const manifestMapFunc = "function (doc, meta){\n  if (doc.isManifest) {\n    emit(meta.id, doc);\n  }\n}"
const manifestReduceFunc = "function (keys, values) {\n  var out = []; for (var i = 0; i < values.length; i++) { var d = {id: keys[i], model: values[i].model, structure: values[i].structure, listDisplay: values[i].listDisplay, formDisplay: values[i].formDisplay}; out.push(d); }; return out;}"

type dataContainer struct {
	Model string `json:"model"`
	Data map[string]interface{} `json:"data"`
}

type manifestData struct {
	IsManifest bool `json:"isManifest"`
	Model string `json:"model"`
	Structure map[string]string `json:"structure"`
	ListDisplay []interface{} `json:"listDisplay"`
	FormDisplay []interface{} `json:"formDisplay"`
}

type viewDoc struct {
	Views struct {
		All struct {
			Map string `json:"map"`
			Reduce string `json:"reduce"`
		} `json:"all"`
	} `json:"views"`
}

func saveModelManifest(bucket *couchbase.Bucket, data *dataContainer) error {
	// create a manifest view if none
	var rv map[string]interface{}
	_, merr := bucket.View("manifest", "all", rv)
	if merr != nil {
		mvd := new(viewDoc)
		mvd.Views.All.Map = manifestMapFunc
		mvd.Views.All.Reduce = manifestReduceFunc
		bucket.PutDDoc("manifest", mvd)
	}

	manifest := new(manifestData)
	manifest.IsManifest = true
	manifest.Model = data.Model
	manifest.Structure = make(map[string]string)
        manifest.ListDisplay = make([]interface{}, 0)
        manifest.FormDisplay = make([]interface{}, 0)
	for k, v := range data.Data {
		switch v.(type) {
			case string:
			manifest.Structure[k] = "string"
		case bool:
			manifest.Structure[k] = "boolean"
		case int:
			manifest.Structure[k] = "number"
		case interface{}:
			manifest.Structure[k] = "object"
		case []int:
			manifest.Structure[k] = "array"
			default:
			manifest.Structure[k] = "string"
		}
                manifest.ListDisplay = append(manifest.ListDisplay, string(k))
                manifest.FormDisplay = append(manifest.FormDisplay, string(k))
	}
	id := makeId()
	verr := bucket.Set(id, 0, manifest)
	return verr
}

func saveModelView(bucket *couchbase.Bucket, data *dataContainer) error {
	// create all view if not existing
	var rv map[string]interface{}
	_, verr := bucket.View(data.Model, "all", rv)
	if verr != nil {
		vd := new(viewDoc)
		vd.Views.All.Map = fmt.Sprintf(allMapFunc, data.Model)
		vd.Views.All.Reduce = allReduceFunc
		bucket.PutDDoc(data.Model, vd)
		saveModelManifest(bucket, data)
	}

	return verr
}

func makeId() string {
	u4, _ := uuid.NewV4()
	return u4.String()
}

type DataController struct {}

func (cr *DataController) Create(cx *goweb.Context) {
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "POST")
	data := new(dataContainer)
	data.Model = cx.PathParams["model"]
	errs := cx.Fill(&data.Data)
	if errs != nil {
		log.Print(errs)
		cx.RespondWithError(500)
	} else {
		bucket, berr := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
		if berr != nil {
			log.Print(berr)
			cx.WriteResponse(data, http.StatusInternalServerError)
		} else {
			id := makeId()
			data.Data["id"] = id
			errr := bucket.Set(id, 0, data)
			if errr != nil {
				log.Print(errr)
				cx.WriteResponse(data.Data, http.StatusInternalServerError)
			} else {
				saveModelView(bucket, data)
				cx.WriteResponse(data.Data, http.StatusCreated)
			}
		}
	}
}
func (cr *DataController) Delete(id string, cx *goweb.Context) {
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "DELETE")
	bucket, err := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
	if err != nil {
		log.Print(err)
		cx.WriteResponse("", http.StatusInternalServerError)
	}
	rv := new(dataContainer)
	bucket.Get(id, &rv)
	derr := bucket.Delete(id)
	if derr != nil {
		log.Print(derr)
		cx.WriteResponse(rv.Data, http.StatusInternalServerError)
	} else {
		cx.WriteResponse(rv.Data, http.StatusOK)
	}
}

func (cr *DataController) DeleteMany(cx *goweb.Context) {
        cx.RespondWithStatus(http.StatusNotImplemented)
}

func (cr *DataController) Read(id string, cx *goweb.Context) {
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "GET")
	bucket, err := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
	if err != nil {
		log.Print(err)
	}
	rv := new(dataContainer)
	gerr := bucket.Get(id, &rv)
	if gerr != nil {
    		cx.WriteResponse(rv.Data, http.StatusNotFound)
	} else {
		if rv != nil {
			cx.WriteResponse(rv.Data, http.StatusOK)
		} else {
  			cx.WriteResponse(rv.Data, http.StatusNotFound)
		}
	}        
}

func (cr *DataController) ReadMany(cx *goweb.Context) {
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "GET")
	bucket, err := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
	if err != nil {
		log.Print(err)
	}
	
	rv := make(map[string]interface{})
        rv["stale"] = false
	vres, verr := bucket.View(cx.PathParams["model"], "all", rv)
        if (verr != nil) {
                cx.WriteResponse(make([]string, 0), http.StatusNotFound)
        } else {
	        if (len(vres.Rows) > 0) {
		        cx.WriteResponse(vres.Rows[0].Value, http.StatusOK)
	        } else {
                        cx.WriteResponse(make([]string, 0), http.StatusOK)
                }
        }
}

func (cr *DataController) Update(id string, cx *goweb.Context) {
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "PUT")
	data := new(dataContainer)
	data.Model = cx.PathParams["model"]
	errs := cx.Fill(&data.Data)
	if errs != nil {
		log.Print(errs)
		cx.RespondWithError(500)
	} else {
		bucket, berr := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
		if berr != nil {
			log.Print(berr)
			cx.WriteResponse(data, http.StatusInternalServerError)
		} else {
			data.Data["id"] = id
			errr := bucket.Set(id, 0, data)
			if errr != nil {
				log.Print(errr)
				cx.WriteResponse(data.Data, http.StatusInternalServerError)
			} else {
				cx.WriteResponse(data.Data, http.StatusOK)
			}
		}
	}
}

func (cr *DataController) UpdateMany(cx *goweb.Context) {
        cx.RespondWithStatus(http.StatusNotImplemented)
}

// for OPTIONS /api
func (cr *DataController) Options(cx *goweb.Context) {
	log.Print("wat")

    cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
    cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    cx.RespondWithOK()
}

