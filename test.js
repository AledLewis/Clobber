var clobber = require('./index.js');
var clob_instance = clobber.get_instance({
  "scriptrunner": {
	"jdbc": "jdbc:oracle:thin:@localhost:1521:xe",
	"user": "promotemgr",
	"password": "vagrant",
	"jarLocation": "../gulp-clobber/example/ScriptRunner.jar",
	"codeSourcePath":"../gulp-clobber/example",
	"builder_config_location": "builder.cfg"
  }
});
   
clob_instance('D:\\Users\\aled2\\Workspace\\hack_day\\gulp-clobber\\example\\FoxModules\\MODULE.xml',function(clob_result){
 console.log(clob_result.result);
});