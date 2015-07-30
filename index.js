'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var uuid = require('uuid');
var format = require('string-format');
var temp = require('temp');
var glob = require('glob');

format.extend(String.prototype);

var clobber_dir_name = '.clobber';
var cmd_sr_build = 'java -jar "{0}" -build {1} -label {2} -outfile {3} -logdir {4}';
var cmd_sr_run = 'java -jar "{0}" -run {1} -jdbc {2} -user {3} -password {4} -logdir {5}';

exports.get_instance= function(config){
return function(changed_file_path, outcome) {

  var result;
  var runid = uuid.v1();  
  var fileRelativeDir = path.relative(config.scriptrunner.codeSourcePath,path.dirname(changed_file_path));

  temp.mkdir(clobber_dir_name, function(err, target_working_dir){

    if (err) throw err;
    var target_build_dir = path.join(target_working_dir, 'build');
    var target_build_file_path = path.join(target_build_dir, fileRelativeDir, path.basename(changed_file_path));

    
    fs.ensureFile(target_build_file_path, function(err){
      fs.copySync(changed_file_path, target_build_file_path);
    });
   
    var build_config_location = 
	  config.scriptrunner.builder_config_location?
	    config.scriptrunner.builder_config_location:'builder.cfg';
   
    fs.copySync(
      path.join(config.scriptrunner.codeSourcePath,'ScriptRunner'), 
      path.join(target_build_dir, 'ScriptRunner')
    );
	
	glob(path.join(target_build_dir,'ScriptRunner','builder*.cfg'), function(err, files){
	  for (var i = 0; i <files.length; i++){

	    if (path.basename(files[i]) !== build_config_location){
		   fs.removeSync(files[i]);
		}
	  }
	});
	

    var build_label = 'clobber-{0}-{1}'.format(os.hostname(), runid);
    var build_cmd = cmd_sr_build.format(
      config.scriptrunner.jarLocation,
      target_build_dir, 
      build_label,
      path.join(target_working_dir, build_label + '.zip'),
      target_working_dir
    );
    var run_cmd = cmd_sr_run.format(
      config.scriptrunner.jarLocation,
      path.join(target_working_dir, build_label + '.zip'),
      config.scriptrunner.jdbc, 
      config.scriptrunner.user, 
      config.scriptrunner.password, target_working_dir
    );
    
    exec(build_cmd, function(err,stdout,stderr) {
      var exec_result = {"file_location":changed_file_path, "build_output":stdout};

      if (err) {
        exec_result.result= "error";
        exec_result.err = err;
        exec_result.err_out = stderr;
        outcome(exec_result);
		return;
      }
      
      exec(run_cmd, function(err,stdout, stderr) {
        exec_result.run_output=stdout;

        if (err) {
          exec_result.result= "error";
          exec_result.err = err;
          exec_result.err_out = stderr;
          outcome(exec_result);
		  return;
        } else {
          exec_result.result = "success";
          outcome(exec_result);
		  return;
        }      
      });
    
    });
  });
};
};
