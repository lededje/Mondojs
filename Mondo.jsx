import _ from 'lodash';
import oauth2 from 'simple-oauth2';

const API = 'https://production-api.gmon.io';

const ENDPOINTS = {
	AUTHENTICATION: {
		OAUTH2: '/oauth2/token',
		PING: '/ping/whoami'
	},
	ACCOUNTS: '/accounts',
	BALANCE: '/balance?account_id=<%= accountId %>',
	TRANSACTION: '/transactions/<%= transactionId %>',
	TRANSACTIONS: '/transactions',
	FEED: '/feed'
};

export default class Mondo {

	VERSION: number;

	oath: Object;
	token: Object;

	constructor(clientId: string, clientSecret: string) {

		if (!_.isString(clientId) || !_.isString(clientSecret)) {
			throw new Error('Client id and client password must be defined for instance construction.');
		}

		this.oauth = oauth2({
			clientID: clientId,
			clientSecret: clientSecret,
			site: API,
			tokenPath: API+ENDPOINTS.AUTHENTICATION.OAUTH2,
			authorizationPath: API+ENDPOINTS.AUTHENTICATION.OAUTH2
		});

	}

	auth (username: string, password: string) : Promise {

		if (!_.isString(username) || !_.isString(password)) {
			throw new Error('Username and password must be defined for authorization.');
		}

		return this.oauth.password.getToken({username, password})
			.then((result) : Promise => {
				this.token = this.oauth.accessToken.create(result);
				return this.token;
			});
		;
	}

	expired () {
		if(_.isUndefined(token)) {
			throw new Error('Token not found.');
		}
		return token.expired();
	}

	refresh () {

		if(_.isUndefined(token)) {
			throw new Error('Token not found.');
		}

		return token.refresh();
	}

	revoke () {
		console.warn('No revoke enpoint available.');
		return new Promise().reject()
		// token.revoke('refresh_token');
	}

	accounts () {
		return this.oauth.api('GET', ENDPOINTS.ACCOUNTS, { access_token: this.token.token.access_token });
	}

	balance (accountId: string) {

		if(!_.isString(accountId)) {
			throw new Error('Account id is require to lookup balance.');
		}

		let endpoint: string = _.template(ENDPOINTS.BALANCE)({accountId});

		return this.oauth.api('GET', endpoint, { access_token: this.token.token.access_token });
	}

	transactions (accountId) {

		return this.oauth.api('GET', ENDPOINTS.TRANSACTIONS, { access_token: this.token.token.access_token, account_id: accountId });
	}

	transaction (transactionId: string) {

		if(!_.isString(transactionId)) {
			throw new Error('Transaction id is required to look up single transaction.');
		}

		let endpoint: string = _.template(ENDPOINTS.TRANSACTION)({transactionId});

		return this.oauth.api('GET', endpoint, { access_token: this.token.token.access_token });
	}

	annotate (transactionId: string, annotations: Object) {

		if(!_.isString(transactionId) || _.isEmpty(annotations)) {
			throw new Error('Transaction id is required to specify which transaction to annotate.');
		}

		let endpoint: string = _.template(ENDPOINTS.TRANSACTION)({transactionId});

		let map: Object = {};

		_.forEach(annotations, (val, key) => {
			map[`metadata[${key}]`] = val;
		});

		return this.oauth.api('PATCH', endpoint, _.extend({}, {access_token: this.token.token.access_token}, map));
	}

	feed (accountId: string, item: Object = {}) {

		const REQUIRED_KEYS = ['params[title]', 'params[image_url]'];

		if(_.every(REQUIRED_KEYS, _.hasOwnProperty, item) === false) {
			throw new Error('Both title and image_url are required for a new feed item.');
		}

		let defaults: Object = {
			type: 'basic'
		}

		let headers: Object = _.defaults(defaults, item);

		headers.account_id = accountId;

		return this.oauth.api('POST', ENDPOINTS.FEED, _.extend({}, {access_token: this.token.token.access_token}, headers));
	}

}