'use strict';

//var env = require('node-env-file');
var fs = require('fs');
var elasticsearch = require('elasticsearch');

//env('.env');

const es = elasticsearch.Client({
    //host: process.env.BONSAI_URL,
    host: '35.204.75.52:9200', 
    log: 'info'
});

const INDEX_NAME = 'players';
const INDEX_TYPE = 'details';

/*
 * Since our dummy data is not a valid json file, we can't simply require() it.
 * This function tricks require() to read and export the content of the file, instead of parsing it
 */

function readDataFile(){
    require.extensions['.json'] = function (module, filename) {
        module.exports = fs.readFileSync(filename, 'utf8');
    };

    return require("./data/players.json")
}

function indexExists() {
    return es.indices.exists({
        index: INDEX_NAME
    });
}

function createIndex(){
    return es.indices.create({
        index: INDEX_NAME
    });
}

function deleteIndex(){
    return es.indices.delete({
        index: INDEX_NAME
    });
}

function indexMapping(){
    return es.indices.putMapping({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            properties: {
                firstName: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple"
                },
                lastName: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple"
                },
                address: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            ignore_above: 256
                        }
                    }
                },
                age: {
                    type: "long"
                },
                eyeColor: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            ignore_above: 256
                        }
                    }
                },
                country: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            ignore_above: 256
                        }
                    }
                },
                firstMatch: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            ignore_above: 256
                        }
                    }
                },
                position: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            ignore_above: 256
                        }
                    }
                },
                retired: {
                    type: "boolean"
                },
                height: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            ignore_above: 256
                        }
                    }
                }
            }
        }
    });
}

function addDocument(document){
    return es.index({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            firstName: document.firstName,
            lastName: document.lastName,
            address: document.address,
            age: document.age,
            eyeColor: document.eyeColor,
            country: document.country,
            firstMatch: document.firstMatch,
            position: document.position,
            retired: document.retired,
            height: document.height
        },
        refresh: "true"
    });
}

function bulkAddDocument(){
    return  es.bulk({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: [
            readDataFile()
        ],
        refresh: "true"
    });
}

function getSuggestions(text, size){
    return es.search({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            suggest: {
                firstNameSuggester: {
                    prefix: text,
                    completion: {
                        field: "firstName",
                        size: size,
                        fuzzy: {
                            fuzziness: "auto"
                        }
                    }
                },
                lastNameSuggester: {
                    prefix: text,
                    completion: {
                        field: "lastName",
                        size: size,
                        fuzzy: {
                            fuzziness: "auto"
                        }
                    }
                }
            }

        }
    });
}

function getStat(id){
    return es.search({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            query: {
                term: {
                    "_id": id
                }
            }
        }
    });
}

exports.deleteIndex = deleteIndex;
exports.createIndex = createIndex;
exports.indexExists = indexExists;
exports.indexMapping = indexMapping;
exports.addDocument = addDocument;
exports.bulkAddDocument = bulkAddDocument;
exports.getSuggestions = getSuggestions;
exports.getStat = getStat;
