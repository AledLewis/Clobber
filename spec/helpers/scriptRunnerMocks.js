var nockExec = require( 'nock-exec');
var build;
var run;
var stdout = "Builder std out";
var stderr = "Builder std err";

function overrideExec(options){
  
  var buildSuccess = options.build.success;
  var runSuccess = options.run.success;
  
  nockExec.reset();
  build = 
    nockExec("java.+-build.+")
    .regex()
    .out(stdout)
    .err(stderr)
    .exit(buildSuccess?0:1);
  
  run = 
    nockExec("java.+-run.+")
    .regex()
    .out(stdout)
    .err(stderr)
    .exit(runSuccess?0:1);
}

module.exports.overrideExec = overrideExec;
module.exports.stdout = stdout;
module.exports.stderr = stderr;
