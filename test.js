var clobber = require('./index.js');
var clobInstance = clobber.getInstance({
  "scriptrunner": {
	"jdbc": "jdbc:oracle:thin:@localhost:1521:xe",
	"user": "promotemgr",
	"password": "vagrant",
	"jarLocation": "../gulp-clobber/example/ScriptRunner.jar",
	"codeSourcePath":"../gulp-clobber/example",
	"builderConfigLocation": "builder.cfg"
  }
});
   
clobInstance('D:\\Users\\aled2\\Workspace\\hack_day\\gulp-clobber\\example\\FoxModules\\MODULE.xml',function(clobResult){
 console.log(clobResult.result);
});