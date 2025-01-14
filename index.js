exports.WebReporter = function(options) {
	var self = this;
	var testPassed = 0;
	var testTotal = 0;

	self.url = options.url;
	self.projectName = options.projectName;
	self.environment = options.environment;
	self.slackUrl = options.slackUrl;
	self.channel = options.channel;	

	var testRun =
		{
			projectName : self.projectName,
			environment : self.environment,			
			status : "passed",
			tests : []
		};

	self.specDone = function(sp) {		
		var spec = JSON.parse(JSON.stringify(sp));
		spec._endTime = new Date();
		//remove not needed stack trace.
		for (var i = 0; i < spec.failedExpectations.length;i++)
		{
			spec.failedExpectations[i].stack = '';
		}
		testTotal++;
		if (spec.status === 'failed'){
			testRun.status = "failed";
		}
		if (spec.status === 'passed'){
			testPassed++;
		}
		testRun.tests.push(spec);
	};

	self.jasmineDone = function() {
		testRun.endTime = new Date();
		var request = require('request');
		var pretext = testRun.projectName + " -->>  " + testRun.status.toUpperCase();
		var text = 'Environment: ' + testRun.environment + '  -->> Tests passed: ' + testPassed + '/' + testTotal;
		var color = 'danger';
		if (testRun.status === 'passed')
		{
			color = 'good';
		}
		var attachments = [
			{
				"pretext": pretext,
				"text": text,
				"color": color,
				"title": "Detailed test results",
				"title_link": self.url
			}
		];
		var payload = {"channel": self.channel , "username": "FIR Test Bot","attachments":attachments}
		request.post(self.slackUrl,
			{json: true, body: payload},
		 function(err,res,body){
		 	console.log(err);
		});	
	};
};
