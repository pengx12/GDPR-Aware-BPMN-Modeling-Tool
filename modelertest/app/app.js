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
  var rdfstore = require('rdfstore');
    // import rdfString from '../RDBtoRDF/dataschema.rdf'
    let turtleString='<http://foo.bar/database/InformationTable> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/csvw#Table>.'
    let rdfString=document.getElementById("rdf-as-string").value
    rdbrdfString= rdbrdfString
    // import rdfString from '../RDBtoRDF/try.rdf';
    rdfstore.create(function(err, store) {
      store.load("text/turtle", rdfString, function(err, results) {
      //    store.registerDefaultProfileNamespaces();

        store.execute('SELECT * { ?s ?p ?name }', function(err,results) {
          // alert(results.length);
        });
      });
    });
    // var http = require("http");
    // var blob = new Blob([xml]);
    // let bloburl = [URL.createObjectURL(blob)];
    // var options = {
    //   host: 'localhost',
    //   port: 3030,
    //   path: '/dataset1/update?data='+xml,
    //   method: 'POST'
    // };
    var request = require('request');
  //   let response=request.post('http://localhost:3030/dataset1/update'
  //   , (err, res, body) => {
  //     if (err) {
  //         return console.log(err);
  //     }
  //     console.log('Status Code:', res.statusCode);
  // }
  //   )
    var options = {
      method: 'post',
      url: 'http://localhost:3030/dataset1/update',
      headers: {'Content-Type': 'text/turtle;charset=utf-8'},
      data: turtleString,
  };
  request(options, function(error, response, body) {
      console.log(body);
  });
//     var form = response.form();
// form.append('file', turtleString, {
//   filename: 'myfile.txt',
//   contentType: 'text/plain'
// });
    // var req = http.request(options, function(res) {
    //   console.log('STATUS: ' + res.statusCode);
    //   console.log('HEADERS: ' + JSON.stringify(res.headers));
    //   res.setEncoding('utf8');
    //   res.on('data', function (chunk) {
    //     console.log('BODY: ' + chunk);
    //     alert(chunk);
    //   });
    // });
   let sparqlqry = 'select ?tablename,?purpose where {?annotation <bpmno:forpurpose> ?purpose.?tmp <bpmno:has_targetref>  ?annotation.?tmp <bpmno:has_sourceref>  ?datareference. ?datareference <bpmno:name> ?tablename.}';
  // req.write(require('querystring').stringify(dataq));
  // req.end();

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