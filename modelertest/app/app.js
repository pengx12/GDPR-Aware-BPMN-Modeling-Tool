import $ from 'jquery';

import BpmnModeler from '../../lib/Modeler';

import diagramXML from '../resources/newDiagram.bpmn';

import CSVPlus from '../RDBtoRDF/CSVPlus.js';

import csvString from '../RDBtoRDF/test.csv';

import getDataSchema from '../RDBtoRDF/try.js';
let csvString1={
  'tablename':"InformationTable",
  'colname':["name","email","gender","birthday","phonenumber"],
  'notsensitive':['name']
}
// getDataSchema("http://foo.bar/database",csvString1);

// READING THE XSLT FILE INTO A STRING
import xsltString from '../resources/template.xslt';
let rdbrdfString="" 
var container = $('#js-drop-zone');
var  dataschema=""
// connectdatabase(testtable);
var modeler = new BpmnModeler({
  container: '#js-canvas'
});

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {

  modeler.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }


  });
}

function saveSVG(done) {
  // var http = require("http");

  // var options = {
  //   host: 'localhost',
  //   port: 3030,
  //   path: '/dataset1/query?query=SELECT * WHERE { ?s ?p ?o }',
  //   method: 'POST'
  // };

  // var req = http.request(options, function(res) {
  //   console.log('STATUS: ' + res.statusCode);
  //   console.log('HEADERS: ' + JSON.stringify(res.headers));
  //   res.setEncoding('utf8');
  //   res.on('data', function (chunk) {
  //     console.log('BODY: ' + chunk);
  //     alert(chunk);
  //   });
  // });
// req.end();
  modeler.saveSVG(done);
}

function saveDiagram(done) {

  modeler.saveXML({ format: true }, function(err, xml) {
    $('#xml-as-string').attr({ "value": xml });
    

    done(err, xml);
  });
}

function storeRDF(callback){
	// MAKE SURE THAT YOU GIVE THE DIAGRAM A URI AS WELL! Remember that we discussed this.
	// This can be requested with a dialogue box
	let diagramURI = 'http://example.org/base-uri-for-bmpn-diagram';
	
	// MAKE SURE THAT YOU FIX THE RDF! THE ROOT SHOULD BE rdf:RDF, not rdf:rdf.
	// let rdfString = document.getElementById("rdf-as-string").value;
	let rdfString = "<rdf:RDF xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmno=\"http://dkm.fbk.eu/index.php/BPMN2_Ontology#\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><rdf:description rdf:about=\"http://www.example.org/resource/StartEvent_1\"><rdf:type rdf:resource=\"http://dkm.fbk.eu/index.php/BPMN2_Ontology#startEvent\"></rdf:type></rdf:description><rdf:description rdf:about=\"http://www.example.org/resource/Task_14e76t5\"><rdf:type rdf:resource=\"http://dkm.fbk.eu/index.php/BPMN2_Ontology#task\"></rdf:type><bpmno:name>this</bpmno:name><bpmno:has_sequenceflow rdf:resource=\"http://www.example.org/resource/SequenceFlow_0n0walt\"></bpmno:has_sequenceflow><bpmno:has_sequenceflow rdf:resource=\"http://www.example.org/resource/SequenceFlow_0n0walt\"></bpmno:has_sequenceflow></rdf:description><rdf:description rdf:about=\"http://www.example.org/resource/SequenceFlow_0n0walt\"><rdf:type rdf:resource=\"http://dkm.fbk.eu/index.php/BPMN2_Ontology#sequenceFlow\"></rdf:type><bpmno:has_sourceref rdf:resource=\"http://www.example.org/resource/StartEvent_1\"></bpmno:has_sourceref><bpmno:has_targetref rdf:resource=\"http://www.example.org/resource/Task_14e76t5\"></bpmno:has_targetref><bpmno:has_sequenceflow rdf:resource=\"http://www.example.org/resource/SequenceFlow_0n0walt\"></bpmno:has_sequenceflow><bpmno:has_sequenceflow rdf:resource=\"http://www.example.org/resource/SequenceFlow_0n0walt\"></bpmno:has_sequenceflow></rdf:description></rdf:RDF>";	


	// We will use rdflib to parse the RDF/XML, and then output it in TURTLE/N3 which we can reuse for the SPARQL UPDATE QUERY
	// the flags in the serialization ensure that we use full URIs and no namespace prefixes. While more verbose, it makes
	// prototyping easier. We just need to remove the base URI from the string
	var rdf = require('rdflib');
	var graph = rdf.graph();
	rdf.parse(rdfString, graph, diagramURI, 'application/rdf+xml');
	graph.namespaces = undefined;
	var serial = rdf.serialize(undefined, graph, diagramURI, 'text/n3', undefined, {flags: 'deinprstux'});
	
	// remove the base uri (prefix :), which will be the first line of the string. In other words, remove the first line of the string
	serial = serial.substring(serial.indexOf("\n") + 1).trim();
	
	var sparqlUpdateQuery = `
	DROP SILENT GRAPH <${diagramURI}> ;
	CREATE SILENT GRAPH <${diagramURI}> ;
	INSERT DATA { 
		GRAPH <${diagramURI}> {
			${serial}
		} 
	} `;
	
	// THIS IS HOW THE QUEYRY LOOKS LIKE.
	console.log(sparqlUpdateQuery);
	
	var request = require('request');
	request.post(
		{ url:'http://localhost:3030/dataset1/update?', form: { update: sparqlUpdateQuery } }, 
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('successful update');
				console.log(body);
			} else {
				console.log(response.statusCode)
				console.warn(error);
			}
		});

}


function selsparql(sparqlqry,callback){
  var http = require("http");

  var options = {
    host: 'localhost',
    port: 3030,
    path: '/dataset1/query?query='+sparqlqry,
    method: 'POST'
  };

  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      alert(chunk);
    });
  });
req.end();
}
function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });
  $('#storeRDF').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    storeRDF();
  });


  $('#createDataSchema').click(function(e) {
    dataschema=prompt("Input Database Schema"); 
    // alert(dataschema);
    let csvString={
      'tablename':"InformationTable",
      'colname':["name","email","gender","birthday","phonenumber"],
      'notsensitive':['name']
    }
    console.log(JSON.stringify(csvString))
    if (dataschema!=null){
      csvString=eval('(' + dataschema + ')');
      // csvString=JSON.parse(dataschema); 
    }
    let url="http://foo.bar/database"
    if ('url' in csvString){
      url=csvString['url']
    }
    alert(getDataSchema(url,csvString));
  });
  var  fileInput = document.getElementById('DataSchemaFile');
  mapJSONtoRDF(fileInput)
  function mapJSONtoRDF(fileInput) {
  fileInput.addEventListener('change', function () {
    if (!fileInput.value) {
        info.innerHTML = 'have not chosen files';
        return;
    }
    var file = fileInput.files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var filedataschema = e.target.result;
      // let filedataschema=reader.readAsText(file)
      // alert(filedataschema);
      let dataschemajson;
      if (filedataschema!=null){
        dataschemajson=eval('(' + filedataschema + ')');
        // csvString=JSON.parse(dataschema); 
      }

    let finalUrl="http://foo.bar/database"
    if ('finalUrl' in dataschemajson){
      finalUrl=dataschemajson['finalUrl']
    }
      let res=getDataSchema(finalUrl,dataschemajson)
      rdbrdfString=res
      alert(res);
      setEncoded($('#downloadDataSchema'), 'ds.rdf', res);
      // $('#downloadDataSchema').attr({ "value": res });
      // callback(res);
    };
    reader.readAsText(file)
  });

  }
  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $('#xslt-as-string').attr({ "value": xsltString });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);
    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});



// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}