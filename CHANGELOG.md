# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.5.1"></a>
## [1.5.1](https://github.com/PBug90/w3gjs/compare/v1.5.0...v1.5.1) (2020-01-02)


### Bug Fixes

* corrections to playerColor values ([#36](https://github.com/PBug90/w3gjs/issues/36)) ([0e08b96](https://github.com/PBug90/w3gjs/commit/0e08b96))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/PBug90/w3gjs/compare/v1.4.1...v1.5.0) (2019-12-05)


### Features

* parse but skip 0x7a actions ([#34](https://github.com/PBug90/w3gjs/issues/34)) ([bfe1980](https://github.com/PBug90/w3gjs/commit/bfe1980))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/PBug90/w3gjs/compare/v1.4.0...v1.4.1) (2019-11-30)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/PBug90/w3gjs/compare/v1.3.0...v1.4.0) (2019-11-30)


### Features

* allow buffer as input ([#31](https://github.com/PBug90/w3gjs/issues/31)) ([edef518](https://github.com/PBug90/w3gjs/commit/edef518))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/PBug90/w3gjs/compare/v1.2.0...v1.3.0) (2019-08-28)


### Bug Fixes

* properly converts maps with backslash and/or forward slash ([a143318](https://github.com/PBug90/w3gjs/commit/a143318))


### Features

* track parse time and added it to parser output ([e06bfb2](https://github.com/PBug90/w3gjs/commit/e06bfb2))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/anXieTyPB/w3gjs/compare/v1.1.3...v1.2.0) (2019-08-22)


### Features

* detect tome of retraining uses ([#26](https://github.com/anXieTyPB/w3gjs/issues/26)) ([7e96e9d](https://github.com/anXieTyPB/w3gjs/commit/7e96e9d))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/anXieTyPB/w3gjs/compare/v1.1.2...v1.1.3) (2019-08-10)


### Bug Fixes

* correctly sort output players by teamid and then by player id ([#23](https://github.com/anXieTyPB/w3gjs/issues/23)) ([a0edb47](https://github.com/anXieTyPB/w3gjs/commit/a0edb47))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/anXieTyPB/w3gjs/compare/v1.1.1...v1.1.2) (2019-04-26)


### Bug Fixes

* msElapsed is now reset to 0 between multiple parses ([#21](https://github.com/anXieTyPB/w3gjs/issues/21)) ([6a6b4c7](https://github.com/anXieTyPB/w3gjs/commit/6a6b4c7))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/anXieTyPB/w3gjs/compare/v1.1.0...v1.1.1) (2019-03-07)


### Bug Fixes

* parse 0x22 block length as unsigned int ([0a5bd4c](https://github.com/anXieTyPB/w3gjs/commit/0a5bd4c))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/anXieTyPB/w3gjs/compare/v1.0.2...v1.1.0) (2019-03-07)


### Features

* new low level EventEmitter API to emit events for replay blocks ([#20](https://github.com/anXieTyPB/w3gjs/issues/20)) ([b476e5d](https://github.com/anXieTyPB/w3gjs/commit/b476e5d))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/anXieTyPB/w3gjs/compare/v1.0.1...v1.0.2) (2019-01-22)


### Bug Fixes

* added dedicated game version formatting function ([#19](https://github.com/anXieTyPB/w3gjs/issues/19)) ([1c3b2cd](https://github.com/anXieTyPB/w3gjs/commit/1c3b2cd))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/anXieTyPB/w3gjs/compare/v1.0.0...v1.0.1) (2019-01-09)



<a name="1.0.0"></a>
# 1.0.0 (2019-01-07)


### Bug Fixes

* chat scope is parsed and formatted correctly ([393f9b2](https://github.com/anXieTyPB/w3gjs/commit/393f9b2))
* chatlog shape corrected ([ee53110](https://github.com/anXieTyPB/w3gjs/commit/ee53110))
* parse 1.30.2 replays, added 0x22 dynamic block length ([#11](https://github.com/anXieTyPB/w3gjs/issues/11)) ([1c7bfed](https://github.com/anXieTyPB/w3gjs/commit/1c7bfed))
* parse action click coordinates as float instead of int ([#16](https://github.com/anXieTyPB/w3gjs/issues/16)) ([06722a8](https://github.com/anXieTyPB/w3gjs/commit/06722a8))
* parse building-objectids correctly ([65475c0](https://github.com/anXieTyPB/w3gjs/commit/65475c0))
* remove observers array from teams property ([6d4e040](https://github.com/anXieTyPB/w3gjs/commit/6d4e040))


### Features

* action tracking complies with php parser apm standard ([7a47c74](https://github.com/anXieTyPB/w3gjs/commit/7a47c74))
* add player color conversion ([d9f921a](https://github.com/anXieTyPB/w3gjs/commit/d9f921a))
* allow single player games to be parsed successfully ([c626119](https://github.com/anXieTyPB/w3gjs/commit/c626119))
* average player apm calculation ([fdb82fa](https://github.com/anXieTyPB/w3gjs/commit/fdb82fa))
* detect normalized matchup ([5c943b0](https://github.com/anXieTyPB/w3gjs/commit/5c943b0))
* introduced new parser output schema ([#8](https://github.com/anXieTyPB/w3gjs/issues/8)) ([80d6b28](https://github.com/anXieTyPB/w3gjs/commit/80d6b28))
* parse player items, fix for nwg padding at end of file ([c57d21a](https://github.com/anXieTyPB/w3gjs/commit/c57d21a))
* use mapping to differ units / buildings / upgrades / items ([6ed265b](https://github.com/anXieTyPB/w3gjs/commit/6ed265b))
