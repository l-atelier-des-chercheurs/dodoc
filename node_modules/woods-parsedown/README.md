Woods Parsedown
=====

Woods Parsedown is a sub-module of Woods.

It handles the parsing of markdown strings to an object literal with keys and values.

Key/value pairs are defined by a new line starting with:

    keyname: this is a value
    it can span over multiple lines

Parsing the former string will result in an object where object.keyname == 'this is a value\nit can span over multiple lines'
