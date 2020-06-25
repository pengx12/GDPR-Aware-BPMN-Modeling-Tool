import $ from 'jquery';

import BpmnModeler from '../../lib/Modeler';

import diagramXML from '../resources/newDiagram.bpmn';

import CSVPlus from '../RDBtoRDF/CSVPlus.js';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import termscondition from '../resources/termscondition.js';

import csvString from '../RDBtoRDF/test.csv';

import getDataSchema from '../RDBtoRDF/try.js';
let csvString1={
  'tablename':"InformationTable",
  'colname':["name","email","gender","birthday","phonenumber"],
  'notsensitive':['name']
}
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
let gpurposecnt=0
const onturi="http://kdeg.scss.tcd.ie/gdpr-bpmn/ontology#"
let gbaseuri="http://example.org/base-uri-for-bmpn-diagram"
let ginsertsqparql=""
let gcsvsqparql=""
let gloabalsensitivedata=""
let gloabalpurpose=""
let glabelele=new Array()
let goverlayid=new Array()
// getDataSchema("http://foo.bar/database",csvString1);

// READING THE XSLT FILE INTO A STRING
import xsltString from '../resources/template.xslt';

$('#xslt-as-string').attr({ "value": xsltString });
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
  
  modeler.saveSVG(done);
}

function saveDiagram(done) {

  modeler.saveXML({ format: true }, function(err, xml) {
    $('#xml-as-string').attr({ "value": xml });


    if (err) {
      return console.error('could not import BPMN 2.0 diagram', err);
    }
    storeRDF(updateoverlay)
    
    done(err, xml);
  });
}

function updateoverlay(){
  var overlays = modeler.get('overlays');
  for (let x of goverlayid){
    overlays.remove(x);
  }
  goverlayid=new Array()
  for (let x of glabelele){
    let ind =x.lastIndexOf('/')
    x=x.substring(ind+1)
    let oid=overlays.add(x, 'note', {
      position: {
        bottom: 0,
        right: 0
      },
      html: '<div class="diagram-note">involve personal data</div>'
    });
    goverlayid.push(oid)
  }
}
function getSparql(converstr,converttype,baseuri){
  var rdf = require('rdflib');
	var graph = rdf.graph();
	rdf.parse(converstr, graph, baseuri, converttype);
	graph.namespaces = undefined;
	var serial = rdf.serialize(undefined, graph, baseuri, 'text/n3', undefined, {flags: 'deinprstux'});
  serial = serial.substring(serial.indexOf("\n") + 1).trim();
  return serial
}
function storeRDF(done){
	// MAKE SURE THAT YOU GIVE THE DIAGRAM A URI AS WELL! Remember that we discussed this.
	// This can be requested with a dialogue box
  
  document.getElementById('exportrdf').click();
  if (gbaseuri=="")
  {
    let baseuri=prompt("Input Base URI");   
    gbaseuri=baseuri
  }
  let baseuri=gbaseuri
  let rdfString=document.getElementById("rdf-as-string").value
  ginsertsqparql=gcsvsqparql+getSparql(rdfString, 'application/rdf+xml',gbaseuri);

	let diagramURI=baseuri
	var sparqlUpdateQuery = `
	DROP SILENT GRAPH <${diagramURI}> ;
	CREATE SILENT GRAPH <${diagramURI}> ;
	INSERT DATA { 
		GRAPH <${diagramURI}> {
			${ginsertsqparql}
		} 
	} `;
	
	// THIS IS HOW THE QUEYRY LOOKS LIKE.
	console.log(sparqlUpdateQuery);
	
	var request = require('request');
	request.post(
		{ url:'http://localhost:3030/ds/update?', form: { update: sparqlUpdateQuery } }, 
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('successful update');
        console.log(body);
        let sparqlqry='PREFIX bpmno: <http://dkm.fbk.eu/index.php/BPMN2_Ontology#> \
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
      Select ?dataobjectref ?datastorereference ?task ?taskname ?dataname ?purpose ?personaldata where {GRAPH <'+gbaseuri+'> {\
        ?association bpmno:has_targetRef  ?annotation.\
        ?annotation <http://kdeg.scss.tcd.ie/gdpr-bpmn/ontology#purposeannotation> ?purpose.\
        ?association bpmno:has_sourceRef  ?datastorereference.\
        ?datastorereference bpmno:name ?datastorename.\
        ?dataTable <http://www.w3.org/ns/csvw#columns> ?personaldata .\
        ?dataTable <http://www.w3.org/ns/csvw#name> ?datastorename.\
        ?personaldata rdf:type <https://w3id.org/GDPRtEXT/PersonalData> .\
        ?personaldata <http://www.w3.org/ns/csvw#name> ?dataname.\
        ?task rdf:type bpmno:task.\
        ?task bpmno:name ?taskname.\
        ?task bpmno:has_dataInputAssociation ?datainputass.\
        ?datainputass bpmno:has_itemAwareElement ?dataobjectref.\
        ?dataobjectref rdf:type bpmno:dataObjectReference.\
        ?dataobjectref bpmno:name ?dataname.\
        }}'
    request.post(
      { url:'http://localhost:3030/ds/query?', form: { query: sparqlqry } }, 
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('successful query');
          console.log(body);
          // alert(body)
          let insersparql=''
          if (body!=null){
            let bodyjson=eval('(' + body + ')');
            let resarr= bodyjson['results']['bindings']
            let gensparq=''
            glabelele=new Array()
            for (let x of resarr){
              let taskuri=x["task"]["value"]
              let purpose=x["purpose"]["value"]
              let datauri=x["personaldata"]["value"]

              glabelele.push(taskuri)
              glabelele.push(x["dataobjectref"]["value"])
              glabelele.push(x["datastorereference"]["value"])
              let hashpurpose=hashCode(purpose)
              gensparq=gensparq+'<'+datauri+'> <https://w3id.org/GConsent#isPersonalDataForConsent> <'+datauri+'consent>.\n'
              gensparq=gensparq+'<'+datauri+'consent> <https://w3id.org/GConsent#forPurpose>'+'<http://www.example.org/resource/purpose'+hashpurpose+'>.\n'              
              gensparq=gensparq+'<http://www.example.org/resource/purpose'+hashpurpose+'>  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/GConsent#Purpose>.\n'
              gensparq=gensparq+'<http://www.example.org/resource/purpose'+hashpurpose+'><'+onturi+'purposecontent>\"'+purpose+'\".\n'
              gensparq=gensparq+'<'+datauri+'consent>  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/GConsent#Consent>.\n'
              gensparq=gensparq+'<'+datauri+'> <'+onturi+'isNecessaryFor> <'+taskuri+'>.\n'
              gensparq=gensparq+'<'+datauri+'consent> <https://w3id.org/GConsent#hasStatus><'+onturi+'ConsentStatusKnowntoRequest>.\n'
            }
          let insertsqparql=getSparql(gensparq, 'text/turtle',gbaseuri);
          done();
          let sparqlUpdateQuery=`INSERT DATA {  
            GRAPH <${gbaseuri}> {
              ${insertsqparql}
            } 
          }` ;
          
          console.log(sparqlUpdateQuery);
          var request = require('request');
          request.post(
            { url:'http://localhost:3030/ds/update?', form: { update: sparqlUpdateQuery } }, 
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log('successful update');
                console.log(body);
                return selsparql();
              } else {
                console.log(response.statusCode)
                console.warn(error);
              }
            });
          }
        } else {
          console.log(response.statusCode)
          console.warn(error);
          alert(error)
        }
      });
			} else {
				console.log(response.statusCode)
				console.warn(error);
			}
		});
    // let sparqlqry="PREFIX bpmno: <http://dkm.fbk.eu/index.php/BPMN2_Ontology#> \
    // PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT * WHERE {GRAPH <http://example.org/base-uri-for-bmpn-diagram> {?s ?p ?o}}"
    
}
function querysparql(sparqlqry,callback){
    var request = require('request');
    request.post(
      { url:'http://localhost:3030/ds/query?', form: { query: sparqlqry } }, 
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('successful query');
          console.log(body);
          if (body!=null){
            let bodyjson=eval('(' + body + ')');
            let resarr= bodyjson['results']['bindings']
            callback (resarr)
        } else {
          console.log(response.statusCode)
          console.warn(error);
          alert(error)
        }
      }});
}

function selsparql(callback){
  let sparqlqry='PREFIX ont:<'+onturi+'> \
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
      Select ?dataname ?purposecontent where {GRAPH <'+gbaseuri+'> {\
        ?consent <https://w3id.org/GConsent#forPurpose> ?purpose.\
        ?data ont:isNecessaryFor  ?task.\
        ?data <https://w3id.org/GConsent#isPersonalDataForConsent>  ?consent.\
        ?purpose ont:purposecontent  ?purposecontent.\
        ?data <http://www.w3.org/ns/csvw#name> ?dataname.\
        }}'
        var request = require('request');
    request.post(
      { url:'http://localhost:3030/ds/query?', form: { query: sparqlqry } }, 
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('successful query');
          console.log(body);
          if (body!=null){
            let bodyjson=eval('(' + body + ')');
            let resarr= bodyjson['results']['bindings']
            let genstate=''

            gloabalsensitivedata=""
            gloabalpurpose=""
            for (let x of resarr){
              let dataname=x["dataname"]["value"]
              let purpose=x["purposecontent"]["value"]
              gloabalsensitivedata+=dataname+' '
              if (gloabalpurpose.indexOf(purpose)==-1)
              {
                gloabalpurpose+=purpose+' '
              }
              genstate=genstate+'Please notice we need user\'s consent to use their '+dataname+' for '+purpose+' purpose.\n'
            }
            let termsconditionarr=termscondition().split('//')
            let strres=''
            for (let x of termsconditionarr){
              x=x.replace('tagpurpose ',gloabalpurpose)
              x=x.replace('tagpersonaldata ',gloabalsensitivedata)
              strres=strres+x
            }
          // alert(genstate)
          // alert (strres)
          setEncoded($('#downloadtermandcon'), 'term and con.txt', strres);
          return strres
        } else {
          console.log(response.statusCode)
          console.warn(error);
          alert(error)
        }
      }});
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
      // saveDiagram(function(err, xml) {
      //   setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
      // });
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
function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}
$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });
  function checkIfNeeded(){
    function selsparql(callback){
      let sparqlqry='PREFIX ont:<'+onturi+'> \
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
          Select ?dataname ?purposecontent where {GRAPH <'+gbaseuri+'> {\
            ?consent <https://w3id.org/GConsent#forPurpose> ?purpose.\
            ?data ont:isNecessaryFor  ?task.\
            ?data <https://w3id.org/GConsent#isPersonalDataForConsent>  ?consent.\
            ?purpose ont:purposecontent  ?purposecontent.\
            ?data <http://www.w3.org/ns/csvw#name> ?dataname.\
            }}'
            var request = require('request');
        request.post(
          { url:'http://localhost:3030/ds/query?', form: { query: sparqlqry } }, 
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log('successful query');
              console.log(body);
              if (body!=null){
                let bodyjson=eval('(' + body + ')');
                let resarr= bodyjson['results']['bindings']
                let genstate=''
    
                gloabalsensitivedata=""
                gloabalpurpose=""
                for (let x of resarr){
                  let dataname=x["dataname"]["value"]
                  let purpose=x["purposecontent"]["value"]
                  gloabalsensitivedata+=dataname+' '
                  if (gloabalpurpose.indexOf(purpose)==-1)
                  {
                    gloabalpurpose+=purpose+' '
                  }
                  genstate=genstate+'Please notice we need user\'s consent to use their '+dataname+' for '+purpose+' purpose.\n'
                }
                let termsconditionarr=termscondition().split('//')
                let strres=''
                for (let x of termsconditionarr){
                  x=x.replace('tagpurpose ',gloabalpurpose)
                  x=x.replace('tagpersonaldata ',gloabalsensitivedata)
                  strres=strres+x
                }
              // alert(genstate)
              // alert (strres)
              setEncoded($('#downloadtermandcon'), 'term and con.txt', strres);
              return strres
            } else {
              console.log(response.statusCode)
              console.warn(error);
              alert(error)
            }
          }});
    }
  }
  $('#storeRDF').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    // storeRDF(checkIfNeeded)

    // document.getElementById('exportrdf').click();
    // if (gbaseuri=="")
    // {
    //   let baseuri=prompt("Input Base URI");   
    //   gbaseuri=baseuri
    // }
    // let rdfString=document.getElementById("rdf-as-string").value
    // //rdfString=rdfString.replace(/rdf:rdf/g, 'rdf:RDF');
    // ginsertsqparql=gcsvsqparql+getSparql(rdfString, 'application/rdf+xml',gbaseuri);
    // let resdata=storeRDF();
    // setEncoded($('#downloadtermandcon'), 'term and con.txt', resdata);
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
    // alert(getDataSchema(url,csvString));
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
      // alert(res);
      setEncoded($('#downloadDataSchema'), 'ds.rdf', res);
      // storeRDF(res, 'text/turtle',gbaseuri);
      gcsvsqparql=getSparql(res, 'text/turtle',gbaseuri);
      if (ginsertsqparql!="")
      {
        storeRDF(updateoverlay)

      }
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