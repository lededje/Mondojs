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

nock('https://production-api.gmon.io', {"encodedQueryParams":true})
	.persist()
	.get('/accounts')
	.reply(200, {
		"accounts":[{
			"id":"acc_000000",
			"account_number":"00000000",
			"sort_code":"000000",
			"created":"2015-11-26T19:06:15.003Z",
			"description":"John Doe"
		}]
	}, {
		'content-type': 'application/json',
		date: 'Wed, 23 Dec 2015 18:52:21 GMT',
		'dest-endpoint': 'handlehttp',
		'dest-service': 'service.api.accounts',
	})
;

nock('https://production-api.gmon.io:443', {"encodedQueryParams":true})
	.get('/balance')
	.query({"account_id":"acc_000092WCNx240x49uoMZeL"})
	.reply(200, {
		"balance":22296,
		"ledger_balance":22296,
		"currency":"GBP",
		"spend_today":-9003
	}, {
		'content-type': 'application/json',
		date: 'Thu, 24 Dec 2015 15:58:46 GMT',
		'dest-endpoint': 'handlehttp',
		'dest-service': 'service.api.balance',
		'trace-id': '69f73a17-613c-438d-48ae-45e3a9bf6384',
		'content-length': '77',
		connection: 'Close'
	})
;

 nock('https://production-api.gmon.io:443', {"encodedQueryParams":true})
	.get('/transactions')
	.query({"account_id":"acc_000092WCNx240x49uoMZeL"})
	.reply(200, {
		"transactions":[{
			"id":"tx_aaaaaa",
			"created":"2015-11-26T19:08:12Z",
			"description":"Initial top up",
			"amount":5000,
			"currency":"GBP",
			"merchant":null,
			"notes":"",
			"metadata":{},
			"account_balance":5000,
			"attachments":[],
			"category":"mondo",
			"is_load":true,
			"settled":"2015-11-26T19:08:12Z",
			"local_amount":5000,
			"local_currency":"GBP"
		},{
			"id":"tx_bbbbbb",
			"created":"2015-11-26T21:57:58Z",
			"description":"SHELL OLD STREET LONDON GBR",
			"amount":0,
			"currency":"GBP",
			"merchant":"merch_000092WRiHjCHD9HgIMctd",
			"notes":"This was to check that this is an active card",
			"metadata": {
				"explanation_extended":"Contact us for more information",
				"hide_amount":"true",
				"hide_transaction":"false",
				"notes":"This was to check that this is an active card"
			},
			"account_balance":5000,
			"attachments":[],
			"category":"cash",
			"is_load":false,
			"settled":"",
			"local_amount":0,
			"local_currency":"GBP"
		},{
			"id":"tx_cccccc",
			"created":"2015-11-26T21:58:27Z",
			"description":"SHELL OLD STREET LONDON GBR",
			"amount":-1000,
			"currency":"GBP",
			"merchant":"merch_000092WRiHjCHD9HgIMctd",
			"notes":"",
			"metadata":{},
			"account_balance":4000,
			"attachments":[],
			"category":"cash",
			"is_load":false,
			"settled":"2015-11-30T06:59:27.345Z",
			"local_amount":-1000,
			"local_currency":"GBP"
		}]},
		{
			'content-type': 'application/json',
			date: 'Thu, 24 Dec 2015 15:59:54 GMT',
			'dest-endpoint': 'handlehttp',
			'dest-service': 'service.api.transactions',
		});

nock('https://production-api.gmon.io:443', {"encodedQueryParams":true})
	.get('/transactions/tx_000092WCYuaFSVRI9ysaAL')
	.reply(200, {"transaction":{"id":"tx_000092WCYuaFSVRI9ysaAL","created":"2015-11-26T19:08:12Z","description":"Initial top up","amount":5000,"currency":"GBP","merchant":null,"notes":"","metadata":{},"account_balance":5000,"attachments":[],"category":"mondo","is_load":true,"settled":"2015-11-26T19:08:12Z","local_amount":5000,"local_currency":"GBP"}}, { 'content-type': 'application/json',
	date: 'Thu, 24 Dec 2015 16:01:24 GMT',
	'dest-endpoint': 'handlehttp',
	'dest-service': 'service.api.transactions',
	'trace-id': '0188f63c-ac71-4e56-773b-0bc8f033a094',
	'content-length': '336',
	connection: 'Close'
});

nock('https://production-api.gmon.io:443', {"encodedQueryParams":true})
	.patch('/transactions/tx_000092WCYuaFSVRI9ysaAL')
	.reply(200, {
		"transaction": {
			"id":"tx_000092WCYuaFSVRI9ysaAL",
			"created":"2015-11-26T19:08:12Z",
			"description":"Initial top up",
			"amount":5000,
			"currency":"GBP",
			"merchant": null,
			"notes":"",
			"metadata":{
				"lorem":"ipsum"
			},
			"account_balance":5000,
			"attachments":null,
			"category":"mondo",
			"is_load":true,
			"settled":"2015-11-26T19:08:12Z",
			"local_amount":5000,
			"local_currency":"GBP"
		}
	}, {
		'content-type': 'application/json',
		date: 'Thu, 24 Dec 2015 16:03:53 GMT',
		'dest-endpoint': 'handlehttp',
		'dest-service': 'service.api.transactions',
	})
;

nock('https://production-api.gmon.io:443', {"encodedQueryParams":true})
	.post('/feed')
	.reply(200, {}, {
		'content-type': 'application/json',
		date: 'Thu, 24 Dec 2015 16:12:16 GMT',
		'dest-endpoint': 'handlehttp',
		'dest-service': 'service.api.feed',
		'trace-id': 'd1a55c35-e432-4aa0-7000-a6fbc202d5d6',
		'content-length': '2',
		connection: 'Close'
	})
;