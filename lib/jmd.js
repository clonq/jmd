var Q = require('q');

module.exports = {

    getMetadata: function(datasource){
        var deferred = Q.defer(); 
        if(datasource instanceof Object) {
            deferred.resolve(extractMetadata(datasource));
        } else {
            //todo: is local file
            //todo: is URL
            deferred.reject(new Error("not implemented"));
        }
        return deferred.promise;
    }

}

function extractMetadata(obj) {
    var ret = {};
    if(ret instanceof Array) {
        //todo: implement metadata extraction for arrays
    } else {
        Object.keys(obj).forEach(function(key){
            ret[key] = kindof(obj[key]);
        })
    }
    return ret;
}

//source: https://github.com/moll/js-kindof/blob/master/kindof.js
function kindof(obj) {
    if (obj === undefined) return "undefined";
    if (obj === null) return "null"
    switch (Object.prototype.toString.call(obj)) {
        case "[object Boolean]": return "boolean"
        case "[object Number]": return "number"
        case "[object String]": return "string"
        case "[object RegExp]": return "regexp"
        case "[object Date]": return "date"
        case "[object Array]": return "array"
        default: return typeof obj
    }
}