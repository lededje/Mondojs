import nock from 'nock';
import config from './config';

nock('https://production-api.gmon.io', {'encodedQueryParams':true})
	.persist()
	.post('/oauth2/token')
	.reply(200, {
		'access_token': config.ACCESS_TOKEN,
		'client_id': config.CLIENT_ID,
		'expires_in': config.EXPIRES_IN,
		'refresh_token': config.REFRESH_TOKEN,
		'token_type': 'Bearer',
		'user_id': config.USER_ID
	}, {
		'content-type': 'application/json',
		'date': 'Wed, 23 Dec 2015 21:36:37 GMT',
		'dest-endpoint': 'handlehttp',
		'dest-service': 'service.api.oauth2',
	})
;