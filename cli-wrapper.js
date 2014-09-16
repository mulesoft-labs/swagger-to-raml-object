#!/usr/bin/env node
var cliArgs = process.argv.slice(2);

if (!cliArgs.length) {
  console.error('Usage: swagger-to-raml <resourceListingFile> <1st apiDeclarationFile> <2nd apiDeclarationFile>...');
  console.error('One resource listing file and at least one api declaration file is required.');
  process.exit(1);
}

var fs = require('fs');
var converter = require('./swagger-to-raml-object.js');

fs.readFile(cliArgs[0], function (err, data){
  if (err) {
    console.error("Error opening file:", cliArgs[0]);
    process.exit(1);
  };
  var listingObj = JSON.parse(data.toString());

  console.log(JSON.stringify(converter.resourceListing(listingObj, {})));
});
