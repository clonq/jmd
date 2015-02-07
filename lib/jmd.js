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
    var ret = {schema:{}};
    if(kindof(obj) === "array") {
        ret.meta = {consistency:{}};
        var keyConsistentencyMap = {};
        var typeConsistentencyMap = {};
        // extract reference keys from the first element
        Object.keys(obj[0]).forEach(function(key){
            // ret[key] = kindof(obj[0][key]);
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
                if(kindof(it[key]) === kindof(obj[0][key])) typeConsistentencyMap[key] = typeConsistentencyMap[key] + 1;
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
            if((keyConsistency === 1) && (typeConsistency === 1)) ret.schema[key] = kindof(obj[0][key]);
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
            ret.schema[key] = kindof(obj[key]);
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