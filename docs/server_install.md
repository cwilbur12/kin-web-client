***This is a draft, feel free to send a PR fixing issues/typos!***

**Goals**
* List all configs you need to set to have a minimum Kin install
* List commands and dependencies needed to run Kin

**Requirements**
* A server / VPS / host
* A domain name + SSL cert for that domain. (see [Let's Encrypt](https://letsencrypt.org/) for an open CA)
* (some) understanding of [Kin's stack](architecture.md)

## Kin Server ##
1. Download Kin API Server [latest release](https://github.com/kintoday/kin-api-server/releases/latest).
2. Follow the instructions in `config.js`, to configure the API server for your particular setup
3. Install Kin's dependencies via `npm`
~~~~~
$ npm install
~~~~~
4. Create the application description file for `PM2`:
~~~~
$ NODE_ENV=prod gulp pm
~~~~
5. Build the server code:
~~~~
$ NODE_ENV=prod gulp servers
~~~~
6. Launch the beast:
~~~~
$ pm2 start pm.json
~~~~

## Kin Client ##
1. Download Kin Web Client [latest release](https://github.com/kintoday/kin-api-server/releases/latest).
2. Follow the instructions In `config.js`, to configure the client for your particular setup
3. Install Kin's dependencies via `npm`
~~~~~
$ npm install
~~~~~
4. Build the client bundle with [Webpack2](https://webpack.github.io/):
~~~~
$ NODE_ENV=prod gulp webpack
~~~~

## Further Recommendations ##

We highly recommend (in no particular order):
* Monitoring the API server
* Configuring a proxy in front of the API and a proper firewall
* Staying up to date with our repositories for bug and security fixes
* Updating regularly the dependencies used by Kin via `npm update`, as well as keep all your server dependencies updated.
* Staying connected with all the time information providers you are connected with for any communication relative to the security of your data, and terms and conditions updates.

... or you can let us take care of all that and support independent open source development ;)
