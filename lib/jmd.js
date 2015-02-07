const Q = require("q")
    , FS = require("fs")
    , UTIL = require("./util")
    , CONSTANTS = require("./constants")

module.exports = {

    getMetadata: function(datasource, opts){
        var deferred = Q.defer(); 
        if(datasource instanceof Object) {
            deferred.resolve(extractMetadata(datasource));
        } else {
            var scheme = UTIL.getScheme(datasource);
            if(CONSTANTS.FILE_SCHEME === scheme) {
                var filename = datasource.substring(CONSTANTS.FILE_SCHEME.length);
                FS.readFile(filename, {encoding:(opts&&opts.encoding)||"utf8"}, function (err, text) {
                    if(err) deferred.reject(new Error(err));
                    else deferred.resolve(extractMetadata(JSON.parse(text)));
                });
            } else if(CONSTANTS.HTTP_SCHEME === scheme) {
                throw(new Error(CONSTANTS.HTTP_SCHEME, "not supported"))
            } else if(CONSTANTS.FTP_SCHEME === scheme) {
                throw(new Error(CONSTANTS.FTP_SCHEME, "not supported"))
            } else {
                FS.readFile(datasource, {encoding:(opts&&opts.encoding)||"utf8"}, function (err, text) {
                    if(err) deferred.reject(new Error(err));
                    else deferred.resolve(extractMetadata(JSON.parse(text)));
                });
            }
        }
        return deferred.promise;
    }

}

function extractMetadata(obj) {
    var ret = {schema:{}};
    if(UTIL.kindof(obj) === "array") {
        ret.meta = {consistency:{}};
        var keyConsistentencyMap = {};
        var typeConsistentencyMap = {};
        // extract reference keys from the first element
        Object.keys(obj[0]).forEach(function(key){
            keyConsistentencyMap[key] = 0;
            typeConsistentencyMap[key] = 0;
        });
        // validate key name consistency relative to the first element
        var isKeyInconsistent = false;
        obj.forEach(function(it){
            Object.keys(keyConsistentencyMap).forEach(function(key){
                if(it[key] !== undefined) keyConsistentencyMap[key] = keyConsistentencyMap[key] + 1;
                else isKeyInconsistent = true;
            })
        });
        // normalize key name consistency values 
        Object.keys(keyConsistentencyMap).forEach(function(key){
            keyConsistentencyMap[key] = {count:keyConsistentencyMap[key]+' out of '+obj.length, consistency:keyConsistentencyMap[key]/obj.length};
        });
        // validate value type consistency relative to the first element 
        var isTypeInconsistent = false;
        obj.forEach(function(it){
            Object.keys(typeConsistentencyMap).forEach(function(key){
                if(UTIL.kindof(it[key]) === UTIL.kindof(obj[0][key])) typeConsistentencyMap[key] = typeConsistentencyMap[key] + 1;
                else isTypeInconsistent = true;
            })
        });
        // normalize value type consistency values 
        Object.keys(typeConsistentencyMap).forEach(function(key){
            typeConsistentencyMap[key] = {count:typeConsistentencyMap[key]+' out of '+obj.length, consistency:typeConsistentencyMap[key]/obj.length};
        });
        // extract consistent keys into schema
        Object.keys(keyConsistentencyMap).forEach(function(key){
            var keyConsistency = keyConsistentencyMap[key].consistency;
            var typeConsistency = typeConsistentencyMap[key].consistency;
            if((keyConsistency === 1) && (typeConsistency === 1)) ret.schema[key] = UTIL.kindof(obj[0][key]);
        });
        // add metadata
        Object.keys(keyConsistentencyMap).forEach(function(key){
            if(keyConsistentencyMap[key].consistency === 1) ret.meta.consistency[key] = {keys:keyConsistentencyMap[key], types:typeConsistentencyMap[key]};
            else ret.meta.consistency[key] = {keys:keyConsistentencyMap[key]};
        });        
        // add comments
        var comments;
        if(Object.keys(obj[0]).length === Object.keys(ret).length) comments = "The data set is 100% consistent both key names and value types wise";
        if(isKeyInconsistent) comments = "The data set is inconsistent key names wise";
        else if(isTypeInconsistent) comments = "The data set is inconsistent value types wise";
        if(comments) ret.comments = comments;
    } else {
        Object.keys(obj).forEach(function(key){
            ret.schema[key] = UTIL.kindof(obj[key]);
        })
    }
    return ret;
}
