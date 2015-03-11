/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Tests                                                                                          */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global __dirname, describe, it */
'use strict';


var xmlify = require('../xmlify.js');
var should = require('should');
var fs     = require('fs');


describe('xmlify', function() {

    it('should convert mongo-blog', function(done) {
        fs.readFile(__dirname+'/tests/mongo-blog.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-blog.json');
            xmlify(json).should.eql(xml);
            done();
        });
    });

    it('should convert mongo-blog-nowrap', function(done) {
        fs.readFile(__dirname+'/tests/mongo-blog-nowrap.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-blog.json');
            xmlify(json, { root: 'blog', wrapArrays: false }).should.eql(xml);
            done();
        });
    });

    it('should convert mongo-people', function(done) {
        fs.readFile(__dirname+'/tests/mongo-people.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-people.json');
            xmlify(json, 'people').should.eql(xml);
            done();
        });
    });

    it('should convert mongo-people (singular root)', function(done) {
        // bit pointless, but must be handled...
        fs.readFile(__dirname+'/tests/mongo-people-person.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-people.json');
            xmlify(json, 'person').should.eql(xml);
            done();
        });
    });

    it('should convert mongo-people (default root)', function(done) {
        // array with no name of objects with no name! not useful, but must be handled...
        fs.readFile(__dirname+'/tests/mongo-people-default.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-people.json');
            xmlify(json).should.eql(xml);
            done();
        });
    });

    it('should convert mongo-people-nowrap', function(done) {
        fs.readFile(__dirname+'/tests/mongo-people-nowrap.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-people.json');
            xmlify(json, {root: 'people', wrapArrays: false}).should.eql(xml);
            done();
        });
    });

    it('should convert mongo-book', function(done) {
        fs.readFile(__dirname+'/tests/mongo-book.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-book.json');
            xmlify(json, {root: 'book', wrappedArrays: true}).should.eql(xml);
            done();
        });
    });

    it('should convert stars', function(done) {
        fs.readFile(__dirname+'/tests/stars.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/stars.json');
            xmlify(json, 'stars').should.eql(xml);
            done();
        });
    });

    it('should convert underscores', function(done) {
        fs.readFile(__dirname+'/tests/underscores.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/underscores.json');
            xmlify(json, 'stars').should.eql(xml);
            done();
        });
    });

    it('should convert wikipedia-json', function(done) {
        fs.readFile(__dirname+'/tests/wikipedia-json.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/wikipedia-json.json');
            xmlify(json, 'person').should.eql(xml);
            done();
        });
    });

    it('should convert wikipedia-json-attr', function(done) {
        fs.readFile(__dirname+'/tests/wikipedia-json-attr.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/wikipedia-json-attr.json');
            xmlify(json, 'person').should.eql(xml);
            done();
        });
    });

    it('should handle edge-cases', function(done) {
        fs.readFile(__dirname+'/tests/edge-cases.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/edge-cases.json');
            xmlify(json, 'test', { xmlDeclaration: true }).should.eql(xml);
            done();
        });
    });

    it('should handle undefined properties', function(done) {
        fs.readFile(__dirname+'/tests/mongo-blog-undefined.xml', function (err, data) {
            if (err) throw err;
            var xml = data.toString().replace(/\n\s*/g, '');
            var json = require(__dirname+'/tests/mongo-blog.json');
            json._id = undefined;
            json.title = undefined;
            xmlify(json, 'test', { xmlDeclaration: true }).should.eql(xml);
            done();
        });
    });

});
