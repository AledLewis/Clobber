#Clobber
Clobber is a utility that runs a [ScriptRunner](https://github.com/Fivium/ScriptRunner) build and run of a file against a database.
##Usage
```javascript
var clobber = require('clobber');
var clob_instance = clobber.get_instance({
  "scriptrunner": {
    "jdbc": "jdbc:oracle:thin:@localhost:1521:xe",
    "user": "promotemgr",
    "password": "pass",
    "jarLocation": "path/to/ScriptRunner.jar",
    "codeSourcePath":"path/to/scriptrunner/build/dir",
    "builder_config_location": "builder.cfg"
  }
});

clob_instance('path/to/file',function(clob_result){
 console.log(clob_result.result);
});
```
