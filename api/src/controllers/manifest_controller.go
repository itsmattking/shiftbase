package controllers

import (
	"log"
	"net/http"
	"code.google.com/p/goweb/goweb"
	"github.com/couchbaselabs/go-couchbase"
)

type ManifestController struct {}

func (cr *ManifestController) Create(cx *goweb.Context) {
        cx.RespondWithStatus(http.StatusNotImplemented)	
}

func (cr *ManifestController) Delete(id string, cx *goweb.Context) {
        cx.RespondWithStatus(http.StatusNotImplemented)	
}

func (cr *ManifestController) DeleteMany(cx *goweb.Context) {
        cx.RespondWithStatus(http.StatusNotImplemented)
}

func (cr *ManifestController) Read(id string, cx *goweb.Context) {
        
	bucket, err := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
	if err != nil {
		log.Print(err)
	}
	rv := new(manifestData)
	gerr := bucket.Get(id, &rv)
	if gerr != nil {
    		cx.WriteResponse(rv, http.StatusNotFound)
	} else {
		if rv != nil {
			cx.WriteResponse(rv, http.StatusOK)
		} else {
  			cx.WriteResponse(rv, http.StatusNotFound)
		}
	}        

}

func (cr *ManifestController) ReadMany(cx *goweb.Context) {
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	bucket, err := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
	if err != nil {
		log.Print(err)
	}
	
	rv := make(map[string]interface{})
	rv["stale"] = false
	vres, _ := bucket.View("manifest", "all", rv)
	if (len(vres.Rows) > 0) {
		cx.WriteResponse(vres.Rows[0].Value, http.StatusOK)
	} else {
		cx.WriteResponse(make([]string, 0), http.StatusOK)
	}
}

func (cr *ManifestController) Update(id string, cx *goweb.Context) {
 	cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","*");
	cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "PUT")
	data := new(manifestData)
        data.IsManifest = true
	errs := cx.Fill(&data)
	if errs != nil {
		log.Print(errs)
		cx.RespondWithError(500)
	} else {
		bucket, berr := couchbase.GetBucket("http://localhost:8091/", "default", "mking.me")
		if berr != nil {
			log.Print(berr)
			cx.WriteResponse(data, http.StatusInternalServerError)
		} else {
			errr := bucket.Set(id, 0, data)
			if errr != nil {
				log.Print(errr)
				cx.WriteResponse(data, http.StatusInternalServerError)
			} else {
				cx.WriteResponse(data, http.StatusOK)
			}
		}
	}
}

func (cr *ManifestController) UpdateMany(cx *goweb.Context) {
        cx.RespondWithStatus(http.StatusNotImplemented)
}