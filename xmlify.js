/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Xmlify                                                   (c) Chris Veness 2014 / MIT Licence  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';


// xmldom for createElement, createTextNode, appendChild, setAttribute;
// inflection for singularisation
var DomParser = require('xmldom').DOMParser;
var inflection = require( 'inflection' );


/*
 * Summary of method:
 *
 * jsToXml(jsObj, elementName, xmlNode):
 *
 * - if elementName is attribute (& jsObj is primitive):
 *   - add jsObj value as attribute to xmlNode
 *
 * - if jsObj is primitive:
 *   - add xml child node 'elementName' to xmlNode
 *   - add primitive value to xml child node
 *
 * - if jsObj is date:
 *   - add xml child node 'elementName' to xmlNode
 *   - add formatted date to xml child node
 *
 * - if jsObj is array:
 *   - if wrapped-arrays & element name is plural, add xml child node 'elementName' to xmlNode
 *   - for each element of array:
 *     - invoke jsToXml with array element, singularised elementName, xml child node
 *
 * - if jsObj is object:
 *   - add xml child node 'elementName' to xmlNode
 *   - for each property of object:
 *     - invoke jsToXml with property value, property name, xml child node
 */


/**
 * Converts JavaScript object to XML.
 *
 * @param {Object} jsObject  JavaScript object to be converted to XML
 * @param {string} [root]    Name of root XML element
 * @param {Object} [options] Options which can be set
 * @returns {string} jsObject converted into XML
 */
var xmlify = function(jsObject /*, [root], [options] */) {

    var config = {
        attributeChar: '_',    // attributes indicator (empty string for no attributes)
        dateFormat: 'ISO',     // how dates should be formatted (ISO / SQL / JS)
        xmlDeclaration: true,  // whether to include an xml declaration
        root: 'root',          // name of XML root element
        wrapArrays: true       // whether to wrap (plural) arrays in enclosing element
    };

    // options: string argument specifies root, object literal specifies any option(s)
    for (var arg=1; arg<arguments.length; arg++) {
        var argument = arguments[arg];
        // string argument is shorthand to specify root
        if (argument.constructor == String) {
            config.root = argument;
        }
        // object argument specifies set of options
        if (argument.constructor == Object) {
            for (var property in config) {
                if (property in argument) config[property] = argument[property];
            }
        }
    }

    var xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

    // dummy document for creating elements & text nodes
    var doc = new DomParser().parseFromString('dummy');

    // insert root tag if jsObject is array and no wrapArrays option to do it for us
    var xmlNode = doc;
    if (jsObject.constructor==Array && !config.wrapArrays) {
        var xmlChildNode = doc.createElement(config.root);
        doc.appendChild(xmlChildNode);
        xmlNode = xmlChildNode;
    }

    // convert jsObject into xmlNode
    jsToXml(jsObject, config.root, xmlNode);

    var xml = doc.documentElement.toString();

    if (config.xmlDeclaration) xml = xmlDeclaration + xml;

    return xml;


    /**
     * Converts (JavaScript) jsObj into (DOM) xmlNode.
     *
     * @param {Object} jsObj       JavaScript object or array of objects to be converted to XML
     * @param {string} elementName Element name to be given to jsObj
     * @param {Object} xmlNode     Node converted JavaScript is to be appended to
     */
    function jsToXml(jsObj, elementName, xmlNode) {

        // if jsObj is a (ISO) string date, convert it to a Date object
        var regexDate = /^\d{4}-\d{2}-\d{2}/;
        if (jsObj && jsObj.constructor == String) {
            var d = regexDate.exec(jsObj);           // string starts yyyy-mm-dd...
            if (d) d = new Date(jsObj);              // ... attempt to convert to date
            if (d && !isNaN(d.getTime())) jsObj = d; // ... it's good, convert jsObj
        }

        // handle attributes
        if (isAttribute(elementName) && (isPrimitive(jsObj) || jsObj.constructor==Date)) {
            var attrName = elementName.slice(1); // remove attributeChar prefix
            var attrVal = jsObj.constructor==Date ? dateFormatted(jsObj) : jsObj.toString();
            xmlNode.setAttribute(attrName, attrVal);
            return;
        }

        // handle primitives
        if (isPrimitive(jsObj)) {
            var val = jsObj===null ? '' : jsObj.toString();
            var node = doc.createTextNode(val);
            var el;
            if (elementName == config.attributeChar) {
                // if elementName == '_', attach value directly to parent
                el = node;
            } else {
                // otherwise normal element + value
                el = doc.createElement(elementName);
                el.appendChild(node);
            }
            xmlNode.appendChild(el);
            return;
        }

        // handle dates
        if (jsObj.constructor == Date) {
            var node = doc.createTextNode(dateFormatted(jsObj));
            var el = doc.createElement(elementName);
            el.appendChild(node);
            xmlNode.appendChild(el);
            return;
        }

        // handle arrays (recursively)
        if (jsObj.constructor == Array) {
            var singularName = inflection.singularize(elementName);
            // add wrapper node?
            if ((config.wrapArrays && elementName!=singularName) || jsObj.length==0) {
                var xmlChildNode = doc.createElement(elementName);
                xmlNode.appendChild(xmlChildNode);
                xmlNode = xmlChildNode;
            }
            // recursively convert each array element
            for (var n=0; n<jsObj.length; n++) {
                if (jsObj[n].constructor == Array) throw Error('Cannot convert nested arrays');
                jsToXml(jsObj[n], config.wrapArrays ? singularName : elementName, xmlNode);
            }
            return;
        }

        // if jsObj is a Mongoose model, convert it to a plain object
        if (jsObj.constructor.name == 'model') jsObj = jsObj.toObject();

        // handle objects (recursively)
        if (typeof jsObj == 'object') {
            var xmlChildNode = doc.createElement(elementName);
            xmlNode.appendChild(xmlChildNode);
            // recursively convert each object property
            for (var childName in jsObj) {
                if (!jsObj.hasOwnProperty(childName)) continue; // ignore inherited properties
                var jsChildObj = jsObj[childName];
                jsToXml(jsChildObj, childName, xmlChildNode);
            }
            return;
        }

        // should never arrive here!
        throw Error('Unrecognised '+(typeof jsObj)+' '+jsObj.constructor.name);
    }


    /**
     * JavaScript primitives are string, number, boolean, null;
     * MongoDb ObjectId objects are also treated as primitive.
     */
    function isPrimitive(v) {
        if (v === undefined) return false;
        if (v === null) return true;
        if (v.constructor == String) return true;
        if (v.constructor == Number) return true;
        if (v.constructor == Boolean) return true;
        if (v.constructor.name == 'ObjectID') return true;
        return false;
    }


    /**
     * Attributes start with underscore (or alternative configured attribute character).
     */
    function isAttribute(propertyName) {
        return propertyName.length>1 && propertyName.slice(0,1)==config.attributeChar;
    }


    /**
     * Dates can be formatted as ISO, SQL (space replacing 'T'), or JavaScript default format.
     */
    function dateFormatted(date) {
        var d;
        try {
            switch (config.dateFormat) {
                case 'ISO': // YYYY-MM-DDTHH:MM:SS.mmmZ
                    d = date.toISOString();
                    break;
                case 'SQL': // YYYY-MM-DD HH:MM:SS
                    d = date.toISOString().replace('T', ' ').split('.')[0];
                    break;
                case 'JS': // JavaScript date format
                    d = date.toString();
                    break;
                default:
                    throw new Error('Unknown date format '+config.dateFormat);
            }
        } catch (e) {
            throw new Error('Invalid date '+date);
        }
        return d;
    }
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = xmlify;
