package main

import (
	"code.google.com/p/goweb/goweb"
	"controllers"
)

const OPTIONS_HTTP_METHOD string = "OPTIONS"
func OptionsMethod(cx *goweb.Context) goweb.RouteMatcherFuncValue {
        if cx.Request.Method == OPTIONS_HTTP_METHOD {
                return goweb.Match
        }
        return goweb.DontCare
}

func main() {

	dataController := new(controllers.DataController)
	manifestController := new(controllers.ManifestController)

	goweb.MapFunc("/api", func(cx *goweb.Context) {
		cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
		cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
		cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		cx.RespondWithOK()
	}, OptionsMethod)
	goweb.MapFunc("/api/{model}/{id}", func(cx *goweb.Context) {
		cx.ResponseWriter.Header().Set("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
		cx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
		cx.ResponseWriter.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		cx.RespondWithOK()
	}, OptionsMethod)
	goweb.MapRest("/api/manifest", manifestController)
	goweb.MapRest("/api/{model}", dataController)

	goweb.ConfigureDefaultFormatters()
	goweb.ListenAndServe(":9000")

}