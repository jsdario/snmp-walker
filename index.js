var snmp = require('snmp-native')
, express = require('express')
, oidsRef = require('./dictionaries/oids')
, typesRef = require('./dictionaries/typesHex') //http://stackoverflow.com/questions/14572006/net-snmp-returned-types
, exec = require('child_process').exec
, app = express();

app.use(express.static(__dirname + '/public'));

app.get('/walk', function(req, res)  {

	var queryOid =  req.query.oid || '.1.3.6.1.2.1';
	var queryHost =  req.query.host || 'localhost';
	console.log(req.query);

	var session = new snmp.Session({ 
		host: 'localhost', 
		port: 161,
		community: 'public' 
	});

	// perform a SNMP walk
	session.get({ oid: queryOid }, function (err, varbinds) {
		if (err) { 
			throw err;
		} else {
			varbinds.forEach(function (vb) {
				// turn data to human readable
				vb.oidReadable = oidsRef['.' + vb.oid.join('.')];
				vb.typeReadable = typesRef[vb.type.toString(16)];
			});
			res.json({
				query : {
					oid : queryOid,
					oidReadable : oidsRef[queryOid]
				},
				host : queryHost,
				walk : varbinds
			});
		}
		session.close();
	});

});

var server = app.listen(3000, function () {
	console.log('Example app listening at http://%s:%s', 
		server.address().address, 
		server.address().port);
});

