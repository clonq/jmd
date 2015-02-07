var should = require('chai').should();
var jmd = require('../index')

describe("api", function() {
    it('should return valid metadata from a json array', function(){
        try {
            jmd.getMetadata();
        } catch(err) {
            should.not.exist(err);
        }
    });
});