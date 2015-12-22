# Unofficial MondoJS

A light weight Mondo library.

Version 0.1.0 Alpha - The Mondo API is currently under active development and breaking changes may be introduced.

### Installation

The Mondo API is still indev and unstable so install directly from Github. Might publish to NPM after they release.

`npm install --save https://github.com/lededje/Mondojs`

`bower install --save https://github.com/lededje/Mondojs`

### Constructor Summary

`new Mondo(clientId, clientSecret) ⇒ Object`

Constructs a new Mondo instance

### Property Summary

`oauth ⇒ Object`

The OAuth instance that was created during construction. Is later used to perform authorized requests.

`token ⇒ Object`

The token created with you use the auth method. Used to authorize subsequent requests to the API.

### Method Summary

`auth(username: string, password: string) ⇒ Promise`

Used for creating a user token. Run before any other requests.

`expired() ⇒ boolean`

Checks to see if the token has expired.

`refresh() ⇒ Promise`

Attempts to refresh the token using the refresh_token acquired from the auth method.

`revoke() ⇒ Promise`

Always returns a failed promise. This endpoint has not been added by Mondo yet.

`accounts() ⇒ Promise`

Returns an array of accounts for the authorized user.

`balance(accountId: string) ⇒ Promise`

Returns balance of the required account. Look up account ids from the accounts method.

`transactions(accountId: string) ⇒ Promise`

Returns transactions from the provided account linked to the account id.

`transaction(transactionId: string) ⇒ Promise`

Returns a detailed transaction from a transaction id. Look up transaction ids from the transaction method.

`annotate(transactionId: string, annotations: object) ⇒ Promise`

Attaches annotations to transactions. Requires transaction ids from the transaction method and a shallow object.


`feed(acountId: string, item: Object) ⇒ Promise`

Attaches posts to a users feed. Item contains specific parameters. See below.