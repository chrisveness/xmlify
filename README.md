**Convert JavaScript(/JSON) objects to XML**

This package is particularly tailored to converting MongoDb / Mongoose documents to XML, for
instance for APIs, RSS feeds, etc, which need to generate XML; though it can also be used for
converting general JavaScript objects to XML.

There are various conventions in use for identifying how properties of JavaScript objects are to be
converted into XML elements and attributes. For compatibility with MongoDb / Mongoose, this package
uses a leading underscore ‘_’ to identify attributes. Otherwise, XML element names are taken from
the JavaScript object property names. Objects and arrays can be nested arbitrarily deeply.

**Summary**

    var xml = xmlify(jsObj, [root], [options]);

**Installation**

    npm install xmlify

**Usage**

For use from eg Mongoose:

    var xmlify = require('xmlify');
    Blog.find(function(err, blogs) {
        if (err) return console.error(err);
        var xml = xmlify(blogs);
        console.log(xml);
    }

With a **MongoDb/Mongoose document**:

    var blog =
        {
            "_id": "54551d0b660186630b790db0",
            "title": "My Blog",
            "author": "Me",
            "body":   "Lots of interesting stuff to read",
            "comments": [
                { "body": "Nice blog", "date": "2014-11-02" },
                { "body": "Bit short", "date": "2014-11-03" }
            ],
            "date": "2014-11-01",
            "hidden": false,
            "meta": {
                "votes": 9,
                "favs": 99
            }
        }

then `xmlify(blog)` will generate:

    <root id="54551d0b660186630b790db0">
        <title>My Blog</title>
        <author>Me</author>
        <body>Lots if interesting stuff to read</body>
        <comments>
            <comment>
                <body>Nice blog</body>
                <date>2014-11-02T00:00:00.000Z</date>
            </comment>
            <comment>
                <body>Bit short</body>
                <date>2014-11-03T00:00:00.000Z</date>
            </comment>
        </comments>
        <date>2014-11-01T00:00:00.000Z</date>
        <hidden>false</hidden>
        <meta>
            <votes>9</votes>
            <favs>99</favs>
        </meta>
    </root>

By default, properties beginning with an underscore are converted to attributes, and pluralised
arrays are wrapped in a singular enclosing element.

**Options**

The name of the root element can be supplied as a argument, as in

    xml = xmlify(blog, 'blog');

The full range of options can be supplied in an *options* object:

* `attributeChar` ['_']: character to interpret as indicating attributes (set to empty string for no attributes)
* `dateFormat` ['ISO']: how dates should be formatted (ISO / SQL / JS)
* `xmlDeclaration` [true]: whether to include an xml declaration
* `root` ['root']: name of the generated XML root element
* `wrapArrays` [true]: whether to wrap (plural) arrays in an enclosing element


So for example `xmlify(blog, { root: 'blog', wrapArrays: false })` will generate

    <blog id="54551d0b660186630b790db0">
        <title>My Blog</title>
        <author>Me</author>
        <body>Lots if interesting stuff to read</body>
        <comments>
            <body>Nice blog</body>
            <date>2014-11-02T00:00:00.000Z</date>
        </comments>
        <comments>
            <body>Bit short</body>
            <date>2014-11-03T00:00:00.000Z</date>
        </comments>
        <date>2014-11-01T00:00:00.000Z</date>
        <hidden>false</hidden>
        <meta>
            <votes>9</votes>
            <favs>99</favs>
        </meta>
    </blog>

With a **MongoDB / Mongoose collection**:

    var people =
        [
            {
                "_id": "544e73265730bb014972de3e",
                "name": { "first": "Walter", "last": "White" }
            },
            {
                "_id": "5454180c3e0dc88a784abc15",
                "name": { "first": "Jesse", "last": "Pinkman" }
            }
        ]

then `xmlify(people, 'people')` will generate

    <people>
        <person id="544e73265730bb014972de3e">
            <name>
                <first>Walter</first>
                <last>White</last>
            </name>
        </person>
        <person id="5454180c3e0dc88a784abc15">
            <name>
                <first>Jesse</first>
                <last>Pinkman</last>
            </name>
        </person>
    </people>

As XML can only have a single root tag, top-level arrays will always be wrapped by the XML root tag,
irrespective of the wrappedArrays setting; though if wrappedArrays is set to false, no singular form
will be used – `xmlify(people, {root: 'people', wrappedArrays: false})` will generate:

    <people>
        <people id="544e73265730bb014972de3e">
            <name>
                <first>Walter</first>
                <last>White</last>
            </name>
        </people>
        <people id="5454180c3e0dc88a784abc15">
            <name>
                <first>Jesse</first>
                <last>Pinkman</last>
            </name>
        </people>
    </people>

Wrapped arrays will only operate on plural array names; with a source object such as:

    var book =
        {
            _id: 123456789,
            title: "MongoDB: The Definitive Guide",
            author: [ "Kristina Chodorow", "Mike Dirolf" ],
            published_date: ISODate("2010-09-24"),
            pages: 216,
            language: "English"
        }

since the `author` array is singular, it will not get wrapped, so `xmlify(book, {root: 'book',
wrappedArrays: true})` will generate:

    <book id="123456789">
        <title>MongoDB: The Definitive Guide</title>
        <author>Kristina Chodorow</author>
        <author>Mike Dirolf</author>
        <published_date>2010-09-24T00:00:00.000Z</published_date>
        <pages>216</pages>
        <language>English</language>
    </book>

Xmlify will also work with simple (non-MongoDb) arrays, so with...

    var stars =
        {
            "star": [
                "Itchy",
                "Scratchy"
            ]
        }

then `xmlify(stars, 'stars')` will generate:

    <stars>
        <star>Itchy</star>
        <star>Scratchy</star>
    </stars>

Using a property name of just underscore (or whatever attribute character option is chosen) will
also fold the structure up – with:

    var stars =
        {
            "star": [
                { "_": "Itchy" },
                { "_": "Scratchy" }
            ]
        }

then `xmlify(stars, 'stars')` will also generate:

    <stars>
        <star>Itchy</star>
        <star>Scratchy</star>
    </stars>

Nested (2-D) arrays cannot be converted, as there is no evident mapping to XML.
