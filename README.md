<h1 align="center">
  <br>
  <a href="https://www.facebook.com/PerthIronKingArena/"><img src="https://i.imgur.com/fZBgAit.png" alt="pika-overlay" width="200"></a>
  <br>
    Perth Iron King Arena overlay
  <br>
</h1>

<p align=center>
  A NodeCG overlay designed for the <a href="https://www.facebook.com/PerthIronKingArena/">Perth Iron King Arena</a> tournament streams.
</p>

## Key features
* Scoreboard and commentator overlays
* Intuitive user interface
* Easily customisable
* Persistent players and commentators via SQLite database

## Releases
Portable binaries for Windows are available in the
[repository tags.](https://github.com/opeik/pika-overlay/tags)

## Getting started
### Prerequisites
* nodejs >= 8.3
* npm >= 2

### Building
Begin by installing nodecg
```
npm install -g bower
git clone https://github.com/nodecg/nodecg.git
cd nodecg
npm install --production
bower install
```

Install pika-overlay
```
cd bundles
git clone https://github.com/opeik/pika-overlay.git
npm install --production sqlite3
```

Run the server
```
node ../../index.js
```

## Built with
* [nodecg](https://github.com/nodecg/nodecg)
* [country-list](https://github.com/fannarsh/country-list)
* [flag-icon-css](https://github.com/lipis/flag-icon-css)
* [jquery](https://jquery.com/)
* [jquery-ui](https://jqueryui.com)
* [Montserrat](https://fonts.google.com/specimen/Montserrat)

## Versioning
We use [Semantic Versioning](http://semver.org/) for versioning.

## License
This project is licensed under the ISC license. Please see the LICENSE.md file
for details.

## Acknowledgments
* The [PIKA](https://www.facebook.com/PerthIronKingArena/) tournament organisers for hosting amazing events
* [Escape Portal](https://www.escapeportal.com.au) for providing an amazing venue
