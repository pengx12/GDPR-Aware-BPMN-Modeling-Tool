function connect(tablename) {
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root1234',
    database : 'test'
    });
    connection.connect();
    let qrystr="select COLUMN_NAME from information_schema.COLUMNS where table_name = ?";
    let qryname='testtable';
    // let qryname=tablename;
    connection.query(qrystr,qryname, function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
    results.forEach(element => {
        console.log(element['COLUMN_NAME'])
    });
    });
    connection.end();
}
module.exports = connect
// connect('testtable')