import $ from 'jquery';

import BpmnModeler from '../../lib/Modeler';

import diagramXML from '../resources/newDiagram.bpmn';

import CSVPlus from '../RDBtoRDF/CSVPlus.js';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import termscondition from '../resources/termscondition.js';

import csvString from '../RDBtoRDF/test.csv';

import getDataSchema from '../RDBtoRDF/try.js';
let csvString1 = {
  'tablename': "InformationTable",
  'colname': ["name", "email", "gender", "birthday", "phonenumber"],
  'notsensitive': ['name']
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
let dataschematype = 'table'
let gpurposecnt = 0
const onturi = "http://kdeg.scss.tcd.ie/gdpr-bpmn/ontology#"
const fusekiuri = "http://localhost:3030/ds1/"
let gbaseuri = "http://example.org/base-uri-for-bmpn-diagram"
let ginsertsqparql = ""
let gcsvsqparql = ""
let gloabalsensitivedata = ""
let gloabalpurpose = ""
let glabelele = new Array()
let goverlayid = new Array()
let gbpmnname = ""
let gmodifytime = 0
// getDataSchema("http://foo.bar/database",csvString1);

// READING THE XSLT FILE INTO A STRING
import xsltString from '../resources/template.xslt';

$('#xslt-as-string').attr({ "value": xsltString });
let rdbrdfString = ""
var container = $('#js-drop-zone');
var dataschema = ""
// connectdatabase(testtable);
var modeler = new BpmnModeler({
  container: '#js-canvas'
});

function loadHistoryRDF() {
  if (gbpmnname != "") {
    let sparqlqry = `SELECT ?g WHERE{
      Graph ?g{
        <http://www.example.org/resource/${gbpmnname}> a <http://dkm.fbk.eu/index.php/BPMN2_Ontology#process> .
        ?g <http://www.w3.org/ns/prov#generatedAtTime> ?date.
      }
    }
    ORDER BY DESC(?date) LIMIT 1`
    querysparql(sparqlqry, function (resarr) {
      for (let x of resarr) {
        let graph = x['g']["value"]
        let UpdateQuery = `
          COPY GRAPH <${graph}>  TO GRAPH <${gbaseuri + '/bpmn'}>
          `;
        updatesparql(UpdateQuery, function () {
          let graph1 = graph.replace('/bpmn_', '/data_')
          let sparqlqry1 = `ASK WHERE { GRAPH <${graph1}>{ ?s ?p ?o } }`
          asksparql(sparqlqry1, function (x) {
              if (x)
              {
                let UpdateQuery1 = `
                  COPY GRAPH <${graph1}>  TO GRAPH <${gbaseuri + '/data'}>
                  `;
                  updatesparql(UpdateQuery1, function () {
                })
              }
            
          })
          let graph2 = graph.replace('/bpmn_', '/purpose_')
          let sparqlqry2 = `ASK WHERE { GRAPH <${graph2}>{ ?s ?p ?o } }`
          asksparql(sparqlqry2, function (x) {
              if (x)
              {
                let UpdateQuery2 = `
                  COPY GRAPH <${graph2}>  TO GRAPH <${gbaseuri + '/purpose'}>
                  `;
                  updatesparql(UpdateQuery2, function () {
                    saveDiagram(function(){})
                })
              }
          })
      })
      }
    })
  }
}

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {

  gmodifytime = 0
  modeler.importXML(xml, function (err) {
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

  modeler.saveXML({ format: true }, function (err, xml) {
    if (gbpmnname == '') {
      gbpmnname = prompt("Please Input a BPMN name");
    }
    $('#xml-as-string').attr({ "value": xml });

    if (err) {
      return console.error('could not import BPMN 2.0 diagram', err);
    }
    document.getElementById('exportrdf').click();
    let rdfString = document.getElementById("rdf-as-string").value
    if (gbpmnname != "") {
      let tmp = `<rdf:description rdf:about="http://www.example.org/resource/${gbpmnname}">
      <rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#process"></rdf:type></rdf:description></rdf:RDF>`
      rdfString = rdfString.replace('</rdf:RDF>', tmp);
    }
    let ginsertsparql = getSparql(rdfString, 'application/rdf+xml', gbaseuri);
    let bpmnuri = '/bpmn'
    storeRDF(bpmnuri, ginsertsparql, updateoverlay)
    done(err, xml);
  });
}

function updateoverlay() {
  var overlays = modeler.get('overlays');
  for (let x of goverlayid) {
    overlays.remove(x);
  }
  goverlayid = new Array()
  for (let x of glabelele) {
    let ind = x.lastIndexOf('/')
    x = x.substring(ind + 1)
    let oid = overlays.add(x, 'note', {
      position: {
        bottom: 0,
        right: 0
      },
      html: '<div class="diagram-note">involve personal data</div>'
    });
    goverlayid.push(oid)
  }
}
function getSparql(converstr, converttype, baseuri) {
  var rdf = require('rdflib');
  var graph = rdf.graph();
  rdf.parse(converstr, graph, baseuri, converttype);
  graph.namespaces = undefined;
  var serial = rdf.serialize(undefined, graph, baseuri, 'text/n3', undefined, { flags: 'deinprstux' });
  serial = serial.substring(serial.indexOf("\n") + 1).trim();
  return serial
}

function todayTime() {
  var date = new Date();
  var curYear = date.getFullYear();
  var curMonth = date.getMonth() + 1;
  var curDate = date.getDate();
  if (curMonth < 10) {
    curMonth = '0' + curMonth;
  }
  if (curDate < 10) {
    curDate = '0' + curDate;
  }
  var curHours = date.getHours();
  var curMinutes = date.getMinutes();
  var curSeconds = date.getSeconds();
  var curtime = curYear + '-' + curMonth + '-' + curDate + 'T' + curHours + ':' + curMinutes + ':' + curSeconds;
  return curtime;
}


function saveRDF(currenttime,savetype) {

  let versionname = gbaseuri + '/' + gbpmnname + savetype + '_' + currenttime;
  let UpdateQuery = `
  COPY GRAPH <${gbaseuri + savetype}>  TO GRAPH <${versionname}>
    `;
  updatesparql(UpdateQuery, function () {
    let insertsparql = '<' + versionname + '> <http://www.w3.org/ns/prov#revisionOf> <' + gbaseuri + '/' + gbpmnname + savetype + '>.\n<' + versionname + '> <http://www.w3.org/ns/prov#generatedAtTime> "' + currenttime + '"^^<http://www.w3.org/2001/XMLSchema#dateTime>.' + '\n'
    var sparqlUpdateQuery = `INSERT DATA { 
      GRAPH <${versionname}> {
        ${insertsparql}
      } 
    } `;
    console.log(sparqlUpdateQuery)
    updatesparql(sparqlUpdateQuery, function () { })
  })
}
function uploadBpmn(insertsparql,cururi,baseuri,done){
  var sparqlUpdateQuery = `
  DROP SILENT GRAPH <${cururi}> ;
  CREATE SILENT GRAPH <${cururi}> ;
  INSERT DATA { 
    GRAPH <${cururi}> {
      ${insertsparql}
    } 
  } `;
  updatesparql(sparqlUpdateQuery, function () {
    let sparqlqry
    if (dataschematype == 'table') {
      sparqlqry = 'PREFIX bpmno: <http://dkm.fbk.eu/index.php/BPMN2_Ontology#> \
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            Select ?dataobjectref ?datastorereference ?task ?taskname ?dataname ?purpose ?personaldata where {GRAPH <'+ gbaseuri + '/bpmn> {\
              ?association bpmno:has_targetRef  ?annotation.\
              ?annotation <http://kdeg.scss.tcd.ie/gdpr-bpmn/ontology#purposeannotation> ?purpose.\
              ?association bpmno:has_sourceRef  ?datastorereference.\
              ?datastorereference bpmno:name ?datastorename.\
              ?task rdf:type bpmno:task.\
              ?task bpmno:name ?taskname.\
              ?task bpmno:has_dataInputAssociation ?datainputass.\
              ?datainputass bpmno:has_itemAwareElement ?dataobjectref.\
              ?dataobjectref rdf:type bpmno:dataObjectReference.\
              ?dataobjectref bpmno:name ?dataname.\
              }\
              GRAPH <'+ gbaseuri + '/data>{\
              ?dataTable <http://www.w3.org/ns/csvw#columns> ?personaldata .\
              ?dataTable <http://www.w3.org/ns/csvw#url> ?datastorename.\
              ?personaldata rdf:type <https://w3id.org/GDPRtEXT/PersonalData> .\
              ?personaldata <http://www.w3.org/ns/csvw#name> ?dataname.\
              }\
            }'
    }
    else {
      sparqlqry = `PREFIX bpmno: <http://dkm.fbk.eu/index.php/BPMN2_Ontology#> 
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            Select ?dataobjectref ?datastorereference ?task ?taskname ?dataname ?purpose ?personaldata where {GRAPH <${gbaseuri}/bpmn> {
              ?association bpmno:has_targetRef  ?annotation.
              ?annotation <http://kdeg.scss.tcd.ie/gdpr-bpmn/ontology#purposeannotation> ?purpose.
              ?association bpmno:has_sourceRef  ?datastorereference.
              ?datastorereference bpmno:name ?datastorename.
              ?dataobjectref rdf:type bpmno:dataObjectReference.
              ?dataobjectref bpmno:name ?dataname.
              ?datainputass bpmno:has_itemAwareElement ?dataobjectref.
              ?task rdf:type bpmno:task.
              ?task bpmno:name ?taskname.
              ?task bpmno:has_dataInputAssociation ?datainputass.
              }
              GRAPH <${gbaseuri}/data>{
                ?dataTable <http://kdeg.scss.tcd.ie/gdpr-bpmn/ontology#hasTable> ?personaldata .
                ?dataTable <http://www.w3.org/ns/csvw#name> ?datastorename.
                ?personaldata rdf:type <https://w3id.org/GDPRtEXT/PersonalData> .
                ?personaldata <http://www.w3.org/ns/csvw#name> ?dataname.
              }
            }`
    }
    querysparql(sparqlqry, function (resarr) {
      let gensparq = ''
      glabelele = new Array()
      for (let x of resarr) {
        let taskuri = x["task"]["value"]
        let purpose = x["purpose"]["value"]
        let datauri = x["personaldata"]["value"]
        glabelele.push(taskuri)
        glabelele.push(x["dataobjectref"]["value"])
        glabelele.push(x["datastorereference"]["value"])
        let hashpurpose = hashCode(purpose)
        gensparq = gensparq + '<' + datauri + '> <https://w3id.org/GConsent#isPersonalDataForConsent> <' + datauri + 'consent>.\n'
        gensparq = gensparq + '<' + datauri + 'consent> <https://w3id.org/GConsent#forPurpose>' + '<http://www.example.org/resource/purpose' + hashpurpose + '>.\n'
        gensparq = gensparq + '<http://www.example.org/resource/purpose' + hashpurpose + '>  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/GConsent#Purpose>.\n'
        gensparq = gensparq + '<http://www.example.org/resource/purpose' + hashpurpose + '><' + onturi + 'purposecontent>\"' + purpose + '\".\n'
        gensparq = gensparq + '<' + datauri + 'consent>  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/GConsent#Consent>.\n'
        gensparq = gensparq + '<' + datauri + '> <' + onturi + 'isNecessaryFor> <' + taskuri + '>.\n'
        gensparq = gensparq + '<' + datauri + 'consent> <https://w3id.org/GConsent#hasStatus><' + onturi + 'ConsentStatusKnowntoRequest>.\n'
      }
      let purposeuri = gbaseuri + '/purpose'
      let insertsqparql = getSparql(gensparq, 'text/turtle', gbaseuri);
      done();

      let sparqlqry1 = `ASK WHERE { GRAPH <${purposeuri}>{ ?s ?p ?o } }`
      asksparql(sparqlqry1, function (x) {
        if (x)
        {
          let UpdateQuery = `
            COPY GRAPH <${purposeuri}>  TO GRAPH <${purposeuri+ '_history'}> 
              `;
            updatesparql(UpdateQuery, function () {
              uploadPurpose(purposeuri,insertsqparql)
            })
        }
        else{
          uploadPurpose(purposeuri,insertsqparql)
        }
      })
    }
    )
  }
  )
}
function uploadPurpose(purposeuri,insertsqparql){
  let sparqlUpdateQuery = `DROP SILENT GRAPH <${purposeuri}> ;
  CREATE SILENT GRAPH <${purposeuri}> ;
  INSERT DATA { 
    GRAPH <${purposeuri}> {
          ${insertsqparql}
        } 
      }` ;
  updatesparql(sparqlUpdateQuery, function () {
  let sparqlqry = 'PREFIX ont:<' + onturi + '> \
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
  Select ?dataname ?purposecontent where {GRAPH <'+ gbaseuri + '/purpose> {\
    ?consent <https://w3id.org/GConsent#forPurpose> ?purpose.\
    ?data ont:isNecessaryFor  ?task.\
    ?data <https://w3id.org/GConsent#isPersonalDataForConsent>  ?consent.\
    ?purpose ont:purposecontent  ?purposecontent.\
    }\
    GRAPH <'+ gbaseuri + '/data> {\
      ?data <http://www.w3.org/ns/csvw#name> ?dataname.\
    }\
    FILTER( NOT EXISTS {\
      GRAPH <'+ gbaseuri + '/purpose_history> {\
        ?consent <https://w3id.org/GConsent#forPurpose> ?purpose.\
        ?data <https://w3id.org/GConsent#isPersonalDataForConsent>  ?consent.\
        ?purpose ont:purposecontent  ?purposecontent.\
      }\
    })\
  }'
  querysparql(sparqlqry, function (resarr) {
    let genstate = ''
    for (let x of resarr) {
      let dataname = x["dataname"]["value"]
      let purpose = x["purposecontent"]["value"]
      gloabalsensitivedata += dataname + ' '
      if (gloabalpurpose.indexOf(purpose) == -1) {
        gloabalpurpose += purpose + ' '
      }
      genstate = genstate + 'A new sensitive data ' + dataname + ' is added. Please notice we need ask for user\'s consent to use their ' + dataname + ' for ' + purpose + ' purpose.\n'
    }
    if (genstate != '') {
      confirm(genstate)
    }
    selsparql();
  })
  })

}
function storeRDF(graphuri, insertsparql, done) {
  // MAKE SURE THAT YOU GIVE THE DIAGRAM A URI AS WELL! Remember that we discussed this.
  // This can be requested with a dialogue box

  // document.getElementById('exportrdf').click();

  gmodifytime += 1
  if (gbaseuri == "") {
    let baseuri = prompt("Input Base URI");
    gbaseuri = baseuri
  }
  let cururi = gbaseuri + graphuri
  let baseuri = cururi + '_history'
  let sparqlqry1 = `ASK WHERE { GRAPH <${cururi}>{ ?s ?p ?o } }`
  asksparql(sparqlqry1, function (x) {
    if (x)
    {
      let UpdateQuery = `
        COPY GRAPH <${cururi}>  TO GRAPH <${baseuri}> 
          `;
        updatesparql(UpdateQuery, function () {
          uploadBpmn(insertsparql,cururi,baseuri,done)
        })
    }
    else{
      uploadBpmn(insertsparql,cururi,baseuri,done)
    }
  })
}
function querysparql(sparqlqry, callback) {
  var request = require('request');
  request.post(
    { url: fusekiuri + 'query?', form: { query: sparqlqry } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('successful query');
        console.log(body);
        if (body != null) {
          let bodyjson = eval('(' + body + ')');
          let resarr = bodyjson['results']['bindings']
          callback(resarr)
        } else {
          console.log(response.statusCode)
          console.warn(error);
        }
      }
    });
}

function asksparql(sparqlqry, callback) {
  var request = require('request');
  request.post(
    { url: fusekiuri + 'query?', form: { query: sparqlqry } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('successful query');
        console.log(body);
        if (body != null) {
          let bodyjson = eval('(' + body + ')');
          callback(bodyjson['boolean'])
        } else {
          console.log(response.statusCode)
          console.warn(error);
        }
      }
    });
}


function updatesparql(sparqlUpdateQuery, callback) {
  var request = require('request');
  request.post(
    { url: fusekiuri + 'update?', form: { update: sparqlUpdateQuery } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('successful query');
        console.log(body);
        callback()
      } else {
        console.log(response.statusCode)
        // console.warn(error);
      }
    });
}

function selsparql(callback) {
  let sparqlqry = 'PREFIX ont:<' + onturi + '> \
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
      Select ?dataname ?purposecontent where {GRAPH <'+ gbaseuri + '> {\
        ?consent <https://w3id.org/GConsent#forPurpose> ?purpose.\
        ?data ont:isNecessaryFor  ?task.\
        ?data <https://w3id.org/GConsent#isPersonalDataForConsent>  ?consent.\
        ?purpose ont:purposecontent  ?purposecontent.\
        ?data <http://www.w3.org/ns/csvw#name> ?dataname.\
        }}'
  var request = require('request');
  request.post(
    { url: fusekiuri + 'query?', form: { query: sparqlqry } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('successful query');
        console.log(body);
        if (body != null) {
          let bodyjson = eval('(' + body + ')');
          let resarr = bodyjson['results']['bindings']
          let genstate = ''

          gloabalsensitivedata = ""
          gloabalpurpose = ""
          for (let x of resarr) {
            let dataname = x["dataname"]["value"]
            let purpose = x["purposecontent"]["value"]
            gloabalsensitivedata += dataname + ' '
            if (gloabalpurpose.indexOf(purpose) == -1) {
              gloabalpurpose += purpose + ' '
            }
            genstate = genstate + 'Please notice we need user\'s consent to use their ' + dataname + ' for ' + purpose + ' purpose.\n'
          }
          let termsconditionarr = termscondition().split('//')
          let strres = ''
          for (let x of termsconditionarr) {
            x = x.replace('tagpurpose ', gloabalpurpose)
            x = x.replace('tagpersonaldata ', gloabalsensitivedata)
            strres = strres + x
          }
          // alert(genstate)
          // alert (strres)
          setEncoded($('#downloadtermandcon'), 'term and con.txt', strres);
          return strres
        } else {
          console.log(response.statusCode)
          console.warn(error);
        }
      }
    });
}
function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    gbpmnname = file.name

    loadHistoryRDF()

    var reader = new FileReader();

    reader.onload = function (e) {

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
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}
$(function () {

  $('#js-create-diagram').click(function (e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });
  function checkIfNeeded() {
    function selsparql(callback) {
      let sparqlqry = 'PREFIX ont:<' + onturi + '> \
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
          Select ?dataname ?purposecontent where {GRAPH <'+ gbaseuri + '> {\
            ?consent <https://w3id.org/GConsent#forPurpose> ?purpose.\
            ?data ont:isNecessaryFor  ?task.\
            ?data <https://w3id.org/GConsent#isPersonalDataForConsent>  ?consent.\
            ?purpose ont:purposecontent  ?purposecontent.\
            ?data <http://www.w3.org/ns/csvw#name> ?dataname.\
            }}'
      var request = require('request');
      request.post(
        { url: fusekiuri + 'query?', form: { query: sparqlqry } },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('successful query');
            console.log(body);
            if (body != null) {
              let bodyjson = eval('(' + body + ')');
              let resarr = bodyjson['results']['bindings']
              let genstate = ''

              gloabalsensitivedata = ""
              gloabalpurpose = ""
              for (let x of resarr) {
                let dataname = x["dataname"]["value"]
                let purpose = x["purposecontent"]["value"]
                gloabalsensitivedata += dataname + ' '
                if (gloabalpurpose.indexOf(purpose) == -1) {
                  gloabalpurpose += purpose + ' '
                }
                genstate = genstate + 'Please notice we need user\'s consent to use their ' + dataname + ' for ' + purpose + ' purpose.\n'
              }
              let termsconditionarr = termscondition().split('//')
              let strres = ''
              for (let x of termsconditionarr) {
                x = x.replace('tagpurpose ', gloabalpurpose)
                x = x.replace('tagpersonaldata ', gloabalsensitivedata)
                strres = strres + x
              }
              // alert(genstate)
              // alert (strres)
              setEncoded($('#downloadtermandcon'), 'term and con.txt', strres);
              return strres
            } else {
              console.log(response.statusCode)
              console.warn(error);
            }
          }
        });
    }
  }
  $('#storeRDF').click(function (e) {
    e.stopPropagation();
    e.preventDefault();
    let currenttime = todayTime()
    saveRDF(currenttime,'/bpmn')
    saveRDF(currenttime,'/data')
    saveRDF(currenttime,'/purpose')
    // document.getElementById('js-download-diagram').click()  
    // storeRDF(checkIfNeeded)
  });


  $('#createDataSchema').click(function (e) {
    dataschema = prompt("Input Database Schema");
    // alert(dataschema);
    let csvString = {
      'tablename': "InformationTable",
      'colname': ["name", "email", "gender", "birthday", "phonenumber"],
      'notsensitive': ['name']
    }
    console.log(JSON.stringify(csvString))
    if (dataschema != null) {
      csvString = eval('(' + dataschema + ')');
      // csvString=JSON.parse(dataschema); 
    }
    let url = "http://foo.bar/database"
    if ('url' in csvString) {
      url = csvString['url']
    }
    // alert(getDataSchema(url,csvString));
  });
  var fileInput = document.getElementById('DataSchemaFile');
  mapJSONtoRDF(fileInput)
  function mapJSONtoRDF(fileInput) {
    fileInput.addEventListener('change', function () {
      if (!fileInput.value) {
        // info.innerHTML = 'have not chosen files';
        return;
      }
      var file = fileInput.files[0];

      var reader = new FileReader();

      reader.onload = function (e) {

        var filedataschema = e.target.result;
        // let filedataschema=reader.readAsText(file)
        // alert(filedataschema);
        let dataschemajson;
        if (filedataschema != null) {
          dataschemajson = eval('(' + filedataschema + ')');
          // csvString=JSON.parse(dataschema); 
        }

        let finalUrl = "http://foo.bar/database"
        if ('finalUrl' in dataschemajson) {
          finalUrl = dataschemajson['finalUrl']
        }
        let dataschema = ""
        if ('type' in dataschemajson) {
          dataschematype = dataschemajson['type']
          if (dataschemajson['type'] == 'table') {
            dataschema = getDataSchema(finalUrl, dataschemajson)
          }
          else if (dataschemajson['type'] == 'database') {
            for (let x of dataschemajson['table']) {
              x['type'] = 'database'
              x['database'] = dataschemajson['database']
              let tmp = getDataSchema(finalUrl, x)
              dataschema += tmp
            }
            dataschema += '<http://www.tcd.ie/data/' + dataschemajson['database'] + '> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/csvw#Database> .'
          }
        }
        // let res=getDataSchema(finalUrl,dataschemajson)
        // rdbrdfString=res
        rdbrdfString = dataschema
        // alert(res);
        setEncoded($('#downloadDataSchema'), 'ds.rdf', rdbrdfString);
        // storeRDF(res, 'text/turtle',gbaseuri);
        gcsvsqparql = getSparql(rdbrdfString, 'text/turtle', gbaseuri);

        let datauri = '/data'
        storeRDF(datauri, gcsvsqparql, updateoverlay)
        // if (ginsertsqparql != "") {
        //   storeRDF(updateoverlay)
        // }
      };
      reader.readAsText(file)
    });

  }
  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function (e) {
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

  var exportArtifacts = debounce(function () {

    saveSVG(function (err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function (err, xml) {

      // setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
      setEncoded(downloadLink, gbpmnname, err ? null : xml);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});



// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}