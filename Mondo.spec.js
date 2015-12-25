
import Mondo, {ENDPOINTS, API, oauth2} from './Mondo';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import nock from 'nock';
import moment from 'Moment'
import Promise from 'promise';
import config from './config';


import './nocks.js';

const USERNAME = 'johndoe@example.com';
const PASSWORD = 'password';

let mondo;
let clock;

before(() => {
	// Clear terminal between each test.
	process.stdout.write('\x1B[2J\x1B[0f');
	console.log(new Date() + '\n');

	// Don't make any real remote requests.
	nock.disableNetConnect();

});

after(() => {
	// Clean up and enable remote requests again.
	nock.cleanAll().enableNetConnect();
})

describe('Mondo', () => {

	describe('constructor', () => {

		it('should throw an error if you don\'t pass in a client id and secret', () => {

			expect(() => {
				return new Mondo();
			}).to.throw(Error);

			expect(() => {
				return new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
			}).to.not.throw(Error);

		});

		it('should use a default api if none are provided', () => {

			let stub = sinon.stub(Mondo.prototype, '__oauthSet', function () {
				this.oauth2 = (config) => {
					expect(config.site).to.equal(API);
				}
			});

			new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);

			Mondo.prototype.__oauthSet.restore();

		});

		it('should allow users to override the api if one is provided', () => {

			const CUSTOM_API = 'https://example.com';

			let stub = sinon.stub(Mondo.prototype, '__oauthSet', function () {
				this.oauth2 = (config) => {
					expect(config.site).to.equal(CUSTOM_API);
				}
			});

			new Mondo(config.CLIENT_ID, config.CLIENT_SECRET, CUSTOM_API);

			Mondo.prototype.__oauthSet.restore();
		});

		it('should set an internal oauth instance containing client ids, secrets and endpoints', () => {

			let stub = sinon.stub(Mondo.prototype, '__oauthSet', function () {

				this.oauth2 = (oauthConfig) => {
					expect(oauthConfig).to.deep.equal({
						clientID: config.CLIENT_ID,
						clientSecret: config.CLIENT_SECRET,
						site: API,
						tokenPath: API+ENDPOINTS.AUTHENTICATION.OAUTH2,
						authorizationPath: API+ENDPOINTS.AUTHENTICATION.OAUTH2
					});
				}
			});

			new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);

			Mondo.prototype.__oauthSet.restore();
		});

	});

	describe('auth', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if you don\'t provide a username and string', () => {

			expect(mondo.auth).to.throw(Error);
			expect(mondo.auth.bind(mondo, USERNAME, PASSWORD)).to.not.throw(Error);
		});

		it('should request a token with the username and password provided', () => {

			let stub = sinon.stub(mondo.oauth.password, 'getToken', function ({username, password}) {
				expect(username).to.equal(USERNAME);
				expect(password).to.equal(PASSWORD);

				return new Promise((resolve) => {
					resolve();
				})
			});

			mondo.auth(USERNAME, PASSWORD);

		});

		it('should store successful token requests on the instance', (done) => {

			mondo.auth(USERNAME, PASSWORD).then(function (token) {

				expect(mondo.token.token.access_token).to.equal(config.ACCESS_TOKEN);
				expect(mondo.token.token.client_id).to.equal(config.CLIENT_ID);
				expect(mondo.token.token.expires_in).to.equal(config.EXPIRES_IN);
				expect(mondo.token.token.refresh_token).to.equal(config.REFRESH_TOKEN);
				expect(mondo.token.token.user_id).to.equal(config.USER_ID);

				// due to it's async nature, this may be 1 millisecond out
				// so testing between two values instead of one.
				expect(mondo.token.token.expires_at.getTime()).to.be.within(moment().add(config.EXPIRES_IN, 'seconds').toDate().getTime()-1, moment().add(config.EXPIRES_IN, 'seconds').toDate().getTime()+1);

				done();
			});

		});

		it('should return a promise', () => {
			let mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);

			expect(mondo.auth(USERNAME, PASSWORD).then).to.exist;

		});

	});

	describe('expired', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if there is no token stored on the instance', () => {
			expect(mondo.expired).to.throw(Error);
		})

		/**
		 * This one is a bit tricky: We must first make a token and test it's
		 * not expired. Then, after that make another one, and tick time past
		 * the expiry and then test again. It has to happen synchronously
		 * or the timer will cause incorrect results. Putting two promises in
		 * the same it function causes race conditions.
		 */
		it('should return whether or not the token is expired', (done) => {

			mondo.auth(USERNAME, PASSWORD).then(function() {

				expect(mondo.expired()).to.be.false;

				clock = sinon.useFakeTimers();

				mondo.auth(USERNAME, PASSWORD).then(function(){

					clock.tick((config.EXPIRES_IN+1)*1000);

					expect(mondo.expired()).to.be.true;

					clock.restore();

					done();

				});
			});
		});

	});

	describe('refresh', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if no token is stored on the instance', () => {
			expect(mondo.refresh).to.throw(Error);
		});

		it('should return a promise', (done) => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.refresh().then).to.be.defined;
				done();
			});
		});
	});

	// Not yet implemented server side.
	describe('revoke', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.revoke).to.throw(Error);
		});

		it('should revoke both the access_token and the refresh_token');
		it('should return a promise')
	});

	describe('accounts', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.accounts).to.throw(Error);
		});

		it('should request the accounts endpoint with the instances\' token', (done) => {

			let spy = sinon.stub(mondo.oauth, 'api', (method, endpoint, options) => {
				expect(method).to.equal('GET');
				expect(endpoint).to.equal(ENDPOINTS.ACCOUNTS);
				expect(options).to.deep.equal({
					access_token: config.ACCESS_TOKEN
				});
				done();
			});

			mondo.auth(USERNAME, PASSWORD).then(() => {
				mondo.accounts();
			});
		});

		it('should return a promise', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.accounts().then).to.exist;
			});
		});
	});

	describe('balance', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.balance.bind(mondo, config.ACCOUNT_ID)).to.throw(Error);
		});

		it('should throw an error if an account id isn\'t passed', () => {

			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.balance).to.throw(Error);
			});

		});

		it('should request the balance endpoint with the instances\' token', (done) => {

			let stub = sinon.stub(mondo.oauth, 'api', (method, endpoint, options) => {

				expect(method).to.equal('GET');
				expect(endpoint).to.equal(_.template(ENDPOINTS.BALANCE)({accountId: config.ACCOUNT_ID}));

				expect(options).to.deep.equal({
					access_token: config.ACCESS_TOKEN
				});

				done();
			});

			mondo.auth(USERNAME, PASSWORD).then(() => {
				mondo.balance(config.ACCOUNT_ID)
			});

		});

		it('should return a promise', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.balance(config.ACCOUNT_ID).then).to.exist;
			});
		});

	});

	describe('transactions', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.transactions.bind(this, config.TRANSACTION_ID)).to.throw(Error);
		});
		it('should throw an error if no account id is provided', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.transactions).to.throw(Error);
			});
		})
		it('should request the transactions endpoint with the instances\' token and the provided account id', (done) => {

			let stub = sinon.stub(mondo.oauth, 'api', (method, endpoint, options) => {
				expect(method).to.equal('GET');
				expect(endpoint).to.equal(ENDPOINTS.TRANSACTIONS);
				expect(options).to.deep.equal({
					account_id: config.ACCOUNT_ID,
					access_token: config.ACCESS_TOKEN
				});
				done();
			});

			mondo.auth(USERNAME, PASSWORD).then(() => {
				mondo.transactions(config.ACCOUNT_ID)
			});

		});
		it('should return a promise', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.transactions(config.ACCOUNT_ID).then).to.exist;
			});
		});

	});

	describe('transaction', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.transaction.bind(mondo, config.TRANSACTION_ID)).to.throw(Error);
		});
		it('should throw an error if no transaction id is provided', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.transaction).to.throw(Error)
			});
		});
		it('should request the balance endpoint with the instances\' token and provided transaction id', (done) => {

			let stub = sinon.stub(mondo.oauth, 'api', function(method, endpoint, options) {

				expect(method).to.equal('GET');
				expect(endpoint).to.equal(_.template(ENDPOINTS.TRANSACTION)({transactionId: config.TRANSACTION_ID}));
				expect(options.access_token).to.equal(config.ACCESS_TOKEN);

				done();

			});

			mondo.auth(USERNAME, PASSWORD).then(() => {
				mondo.transaction(config.TRANSACTION_ID);
			});

		});
		it('should return a promise', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.transaction(config.TRANSACTION_ID).then).to.exist;
			});
		});

	});

	describe('annotate', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.annotate).to.throw(Error);
		});

		it('should throw an error if no transaction id is provided', () => {

			mondo.auth(USERNAME, PASSWORD).then(() => {

				expect(mondo.annotate).to.throw(Error);
				expect(mondo.annotate.bind(mondo, null, {
					lorem: 'ipsum'
				})).to.throw(Error);

			});

		});

		it('should throw an error if no annotation hash is provided', () => {

			mondo.auth(USERNAME, PASSWORD).then(() => {

				expect(mondo.annotate).to.throw(Error);
				expect(mondo.annotate.bind(mondo, config.TRANSACTION_ID, null)).to.throw(Error);

			});

		});

		it('should patch the transaction endpoint with the instances\' token and provided annotation hash in correctly formed headers', () => {
			let stub = sinon.stub(mondo.oauth, 'api', (method, endpoint, options) => {
				expect(method).to.equal('PATCH');
				expect(endpoint).to.equal(_.template(ENDPOINTS.TRANSACTION)({transactionId: config.TRANSACTION_ID}))
				expect(options).to.deep.equal({
					access_token: config.ACCESS_TOKEN,
					'metadata[lorem]': 'ipsum'
				});
			});

			mondo.auth(USERNAME, PASSWORD).then(() => {
				mondo.annotate(config.TRANSACTION_ID, {
					lorem: 'ipsum'
				})
			});

		});

		it('should return a promise', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.annotate(config.TRANSACTION_ID, {
					lorem: 'ipsum'
				}).then).to.exist;
			});
		});

	});

	describe('feed', () => {

		beforeEach(() => {
			mondo = new Mondo(config.CLIENT_ID, config.CLIENT_SECRET);
		});

		it('should throw an error if a token isn\'t stored on the instance', () => {
			expect(mondo.feed).to.throw(Error);
		});

		it('should throw an error if no id is provided');
		it('should throw an error if no annotation hash is provided')
		it('should throw an error the annotation hash donesn\'t contain the required fields')
		it('should post the transaction endpoint with the instances\' token and provided annotation hash in correctly formed headers');
		it('should return a promise', () => {
			mondo.auth(USERNAME, PASSWORD).then(() => {
				expect(mondo.feed(config.ACCOUNT_ID, {
					'params[title]': 'Test: lorem ipsum',
					'params[image_url]': 'https://www.cloudbees.com/sites/default/files/blogger_importer/s1600/jenkinsLogo1.png'
				}).then).to.exist;
			});
		});

	});
});