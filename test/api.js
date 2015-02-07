var should = require('chai').should();
var jmd = require('../index')

var SIMPLE_TEST_OBJECT = {key1:'data', key2:10, key3:true, key4:undefined, key5:new Date(), key6:[1,2,3], key7:null}

describe("api", function() {
    it('should return a valid metadata object for a simple object', function(){
        jmd.getMetadata(SIMPLE_TEST_OBJECT).then(function(metadata){
            should.exist(metadata);
            metadata.should.not.be.empty;
            metadata.should.have.property("key1");
            metadata.key1.should.equal("string");
            metadata.should.have.property("key2");
            metadata.key2.should.equal("number");
            metadata.should.have.property("key3");
            metadata.key3.should.equal("boolean");
            metadata.should.have.property("key4");
            metadata.key4.should.equal("undefined");
            metadata.should.have.property("key5");
            metadata.key5.should.equal("date");
            metadata.should.have.property("key6");
            metadata.key6.should.equal("array");
            metadata.should.have.property("key7");
            metadata.key7.should.equal("null");
        }).done();            
    });
});
