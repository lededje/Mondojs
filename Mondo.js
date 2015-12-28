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

export {ENDPOINTS, API};

export default class Mondo {

	constructor(clientId, clientSecret, api = API) {

		if (!_.isString(clientId) || !_.isString(clientSecret)) {
			throw new Error('Client id and client password must be defined for instance construction.');
		}

		this.oauth2 = oauth2;

		this.__oauthSet();

		this.oauth = this.oauth2({
			clientID: clientId,
			clientSecret: clientSecret,
			site: api,
			tokenPath: api+ENDPOINTS.AUTHENTICATION.OAUTH2,
			authorizationPath: api+ENDPOINTS.AUTHENTICATION.OAUTH2
		});
	}

	__oauthSet () {
		// This is for testing purposes. Oath2 is not easily shim-able as it keeps a lot of it's internals private.
	}

	auth (username, password) {

		if (!_.isString(username) || !_.isString(password)) {
			throw new Error('Username and password must be defined for authorization.');
		}

		return this.oauth.password.getToken({username, password})
			.then((result) => {
				this.token = this.oauth.accessToken.create(result);
				return this.token;
			});
		;
	}

	expired () {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}
		return this.token.expired();
	}

	refresh () {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		return this.token.refresh();
	}

	revoke () {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		console.warn('No revoke enpoint available.');
		return new Promise((resolve, reject) => {
			reject();
		})
		// token.revoke('refresh_token');
	}

	accounts () {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		return this.oauth.api('GET', ENDPOINTS.ACCOUNTS, { access_token: this.token.token.access_token });
	}

	balance (accountId) {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		if(!_.isString(accountId)) {
			throw new Error('Account id is require to lookup balance.');
		}

		let endpoint = _.template(ENDPOINTS.BALANCE)({accountId});

		return this.oauth.api('GET', endpoint, { access_token: this.token.token.access_token });
	}

	transactions (accountId) {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		return this.oauth.api('GET', ENDPOINTS.TRANSACTIONS, { access_token: this.token.token.access_token, account_id: accountId });
	}

	transaction (transactionId) {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		if(!_.isString(transactionId)) {
			throw new Error('Transaction id is required to look up single transaction.');
		}

		let endpoint = _.template(ENDPOINTS.TRANSACTION)({transactionId});

		return this.oauth.api('GET', endpoint, { access_token: this.token.token.access_token });
	}

	annotate (transactionId, annotations) {

		if(!_.isString(transactionId) || _.isEmpty(annotations)) {
			throw new Error('Transaction id is required to specify which transaction to annotate.');
		}

		let endpoint = _.template(ENDPOINTS.TRANSACTION)({transactionId});

		let map = {};

		_.forEach(annotations, (val, key) => {
			map[`metadata[${key}]`] = val;
		});

		return this.oauth.api('PATCH', endpoint, _.extend({}, {access_token: this.token.token.access_token}, map));
	}

	feed (accountId, item = {}) {

		if(_.isUndefined(this.token)) {
			throw new Error('Token not found.');
		}

		const REQUIRED_KEYS = ['params[title]', 'params[image_url]'];

		if(_.every(REQUIRED_KEYS, _.hasOwnProperty, item) === false) {
			throw new Error('Both title and image_url are required for a new feed item.');
		}

		if(_.isString(accountId) === false) {
			throw new Error('An account id is required to add items to it\'s feed');
		}

		let defaults = {
			type: 'basic'
		}

		let headers = _.defaults(defaults, item);

		headers.account_id = accountId;

		return this.oauth.api('POST', ENDPOINTS.FEED, _.extend({}, {access_token: this.token.token.access_token}, headers));
	}

}