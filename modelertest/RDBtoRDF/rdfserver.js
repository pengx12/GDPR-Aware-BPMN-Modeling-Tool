var rdfstore = require('rdfstore');
let turtleString='<http://foo.bar/database/InformationTable> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/csvw#Table>.'

// import rdfString from '../RDBtoRDF/try.rdf';
rdfstore.create(function(err, store) {
	store.load("text/turtle", turtleString, function(err, results) {
	//    store.registerDefaultProfileNamespaces();

	   store.execute('SELECT * { ?s ?p ?name }', function(err,results) {
		//    test.ok(results.length === 1);
		//    test.ok(results[0].name.value === "Celia");
	   });
	});
});