var constantObj = sails.config.constants;

exports.sendPush = function(device) {
console.log('device******',device);
	
	
	if (device.device_type == "IOS") {
	PushService.sendToIOS(device.device_token,device.message,device)
	} else if (device.device_type == "ANDROID") {
	PushService.sendToAndroid(device.device_token,device.message,device)
	}
};

exports.sendToIOS = function(deviceToken,message,value) {

	var apns = require('apn');
	var path = require('path');
	var deviceTokenArray = [deviceToken];
	
	var errorCallback = function(err, notif) {
		console.log('ERROR : ' + err + '\nNOTIFICATION : ' + notif);
	}

	var options = {
		/*live mode*/
		production: false ,  
		passphrase: "123456",
		ca: null,
		pfx: null,
		pfxData: null,
		//port: 2195,
		rejectUnauthorized: true,
		enhanced: true,
		errorCallback: errorCallback,
		cacheLength: 100,
		autoAdjustCache: true,
		connectionTimeout: 0
	}

	var mode = sails.config.constants.pushEnv.env;
	if (mode == "prod") {

		options.gateway = "gateway.push.apple.com";
		//options.key = path.resolve('./keys/abc.pem');
		options.cert = path.resolve('./keys/apns_dev_cert.pem');

	} else {
		options.gateway = "gateway.sandbox.push.apple.com";
		options.key = path.resolve('./keys/PushChatKey.pem');
		options.cert = path.resolve('./keys/PushChatCert.pem');
	}

	var apnsConnection = new apns.Provider(options);
	var note = new apns.Notification();

	note.expiry = Math.floor(Date.now() / 1000) + 3600;
	note.sound = 'default';
	note.badge = 1;
	note.alert = message;
	note.contentAvailable = 1;
	note.payload = { 
		"value": value
	}

	apnsConnection.send(note, deviceTokenArray)
	.then(function(result) {
	})

	apnsConnection.on('error', log('error'));
	apnsConnection.on('transmitted', log('transmitted'));
	apnsConnection.on('timeout', log('timeout'));
	apnsConnection.on('connected', log('connected'));
	apnsConnection.on('disconnected', log('disconnected'));
	apnsConnection.on('socketError', log('socketError'));
	apnsConnection.on('transmissionError', log('transmissionError'));
	apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
	
	function log(type) {

		return function() {
			if((type=="transmitted") || (type == "connected"))
			return cb(null,arguments)
		}
	}
};

exports.sendToAndroid = function(token,message,data) {
	var FCM = require('fcm-node');

	console.log('rrererererer**',data);
	
	// var serverKey = "AAAAiFzHemg:APA91bHerjlqBpPGsGmgzWzPBRIa6VCop0H8dz3WUtYycXaVrCRpIcOcTu0iytYBcdoPBVvx5x_twi8jSEg15hjkwIEudef5An6LeWDjEfFUWW_NX-NGEY3epmF1Vwz2fGFqdU1DPa62"; //"AIzaSyDry-zM5968brTY_L6bX8_coC5Jbg87hAg"
	var serverKey = "AAAA30tmCng:APA91bHfjmBtkT6IDV0AoNWsL37PFXa9H4U03Nb8kAfTcr_ceISFkzgxuilrbaVTnR_QPIZQYQutOM2iqsv98Qb4_m1jVBpmUVcA3IPEhWXkRjY_FhD1EdvEyKuUXhj67q7qSZ32lGZA";

	var validDeviceRegistrationToken = token;

	var fcmCli = new FCM(serverKey);

	var msg = JSON.stringify(data.message);	
	var payloadOK = {
			to: validDeviceRegistrationToken,
			data: { //some data object (optional)			
				value: data
			},
			priority: 'high',
			content_available: true,
			notification: { //notification object
				title: 'Dispensaries',
				body: data.message,
				sound: "default",
				badge: "1"
			}
		};
	// console.log('payloadOK',payloadOK);
	/*var callbackLog = function(sender, err, res) {
		return function() {
		}
	};*/	

	fcmCli.send(payloadOK, function(err, res) {
		//return cb(null,res)	
		console.log("sdsss", res);
		return true;
	});
}