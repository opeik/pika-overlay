# PIKA scoreboard overlay
A NodeCG overlay designed for the Perth Iron King Arena tournament streams.
Designed to primarily work with OBS, but should work with any streaming software
which supports Chromium-based browser sources.

## Getting started
### Prerequisites
* nodejs >= 8.3
* npm >= 2

### Installation

Begin by installing NodeCG.
```
npm install -g bower
git clone https://github.com/nodecg/nodecg.git
cd nodecg
npm install --production
bower install
```

Install pika-overlay.
```
cd bundles
git clone https://github.com/opeik/pika-overlay.git
npm install --production sqlite3
```

Run the server.
```
cd ..
node index.js
```

## Built with
* [country-list](https://github.com/fannarsh/country-list)
* [flag-icon-css](https://github.com/lipis/flag-icon-css)
* [jquery](https://jquery.com/)
* [jquery-ui](https://jqueryui.com)

## Versioning
We use [SemVer](http://semver.org/) for versioning. For the versions available,
see the [tags on this repository](https://github.com/opeik/pika-overlay/tags).

## License
This project is licensed under the ISC license. Please see the LICENSE.md file
for details.
