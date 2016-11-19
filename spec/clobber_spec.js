"use strict";
var sr = require('./helpers/scriptRunnerMocks.js');
var slobber = require("../index.js");
var realFileLocations = require('./helpers/realFileLocations.js');
var path = require('path')

describe("Slobber", function () {
  var slobResult;
  beforeEach(function () {

    this.slobberConfig = {
      "jdbc": "mocked",
      "user": "mocked",
      "password": "mocked",
      "jarLocation": "mocked",
      "codeSourcePath": realFileLocations.validCodeSourcePath,
      "builder_config_location": realFileLocations.validBuildFile,
    }

  });


  describe("running slobber successfully", function () {


    beforeEach(function (done) {


      sr.overrideExec(
        {
          "build": { "success": true },
          "run": { "success": true }
        }
      );

      var slobberInst = slobber.getInstance(this.slobberConfig);

      slobberInst(realFileLocations.validFilePath, function (srResult) {
        slobResult = srResult;
        done();
      });

    });

    it("returns a success result", function (done) {
      expect(slobResult.result).toEqual("success");
      done();
    });

    it("returns the clob file path", function (done) {
      expect(slobResult.clobFile).toEqual(
        path.relative(realFileLocations.validCodeSourcePath, realFileLocations.validFilePath)

      );
      done();

    });
  });


  describe("build failing", function () {
    beforeEach(function (done) {

      sr.overrideExec(
        {
          "build": { "success": false },
          "run": { "success": true }
        }
      );

      var slobberInst = slobber.getInstance(this.slobberConfig);

      slobberInst(realFileLocations.validFilePath, function (srResult) {
        slobResult = srResult;
        done();
      });

    });

    it("returns a fail result", function (done) {
      expect(slobResult.result).toEqual("failure");
      done();
    });

    it("returns the clob file path", function (done) {
      expect(slobResult.clobFile).toEqual(
        path.relative(realFileLocations.validCodeSourcePath, realFileLocations.validFilePath)
      );
      done();

    });
    it("returns sysout and syserr", function (done) {
      expect(slobResult.sysout).toEqual(sr.sysout);
      expect(slobResult.syserr).toEqual(sr.syserr);
      done();

    });
  });

  describe("run failing", function () {
    beforeEach(function (done) {

      sr.overrideExec(
        {
          "build": { "success": true },
          "run": { "success": false }
        }
      );

      var slobberInst = slobber.getInstance(this.slobberConfig);

      slobberInst(realFileLocations.validFilePath, function (srResult) {
        slobResult = srResult;
        done();
      });

    });

    it("returns a fail result", function (done) {
      expect(slobResult.result).toEqual("failure");
      done();
    });

    it("returns the clob file path", function (done) {
      expect(slobResult.clobFile).toEqual(
        path.relative(realFileLocations.validCodeSourcePath, realFileLocations.validFilePath)
      );
      done();

    });
    it("returns sysout and syserr", function (done) {
      expect(slobResult.sysout).toEqual(sr.sysout);
      expect(slobResult.syserr).toEqual(sr.syserr);
      done();

    });
  });


});
