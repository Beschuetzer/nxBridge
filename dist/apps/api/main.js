(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./apps/api/src/app/app.controller.ts":
/*!********************************************!*\
  !*** ./apps/api/src/app/app.controller.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/api/src/app/app.service.ts");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
};
AppController = tslib_1.__decorate([
    common_1.Controller(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);
exports.AppController = AppController;


/***/ }),

/***/ "./apps/api/src/app/app.module.ts":
/*!****************************************!*\
  !*** ./apps/api/src/app/app.module.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./apps/api/src/app/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/api/src/app/app.service.ts");
const controllers_module_1 = __webpack_require__(/*! ./controllers/controllers.module */ "./apps/api/src/app/controllers/controllers.module.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const dotenv = __webpack_require__(/*! dotenv */ "dotenv");
const serve_static_1 = __webpack_require__(/*! @nestjs/serve-static */ "@nestjs/serve-static"); // <- INSERT LINE
const path_1 = __webpack_require__(/*! path */ "path"); // <- INSERT LINE
dotenv.config();
let AppModule = class AppModule {
};
AppModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            controllers_module_1.ControllersModule,
            mongoose_1.MongooseModule.forRoot(process.env.mongoDB_URI),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path_1.join(__dirname, '..', 'frontend'),
                exclude: ['/api*']
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
exports.AppModule = AppModule;


/***/ }),

/***/ "./apps/api/src/app/app.service.ts":
/*!*****************************************!*\
  !*** ./apps/api/src/app/app.service.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AppService = class AppService {
};
AppService = tslib_1.__decorate([
    common_1.Injectable()
], AppService);
exports.AppService = AppService;


/***/ }),

/***/ "./apps/api/src/app/controllers/controllers.module.ts":
/*!************************************************************!*\
  !*** ./apps/api/src/app/controllers/controllers.module.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllersModule = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const api_mongoose_models_1 = __webpack_require__(/*! @nx-bridge/api-mongoose-models */ "./libs/api-mongoose-models/src/index.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const getUser_controller_1 = __webpack_require__(/*! ./getUser/getUser.controller */ "./apps/api/src/app/controllers/getUser/getUser.controller.ts");
const getUsers_controller_1 = __webpack_require__(/*! ./getUsers/getUsers.controller */ "./apps/api/src/app/controllers/getUsers/getUsers.controller.ts");
const getGames_controller_1 = __webpack_require__(/*! ./getGames/getGames.controller */ "./apps/api/src/app/controllers/getGames/getGames.controller.ts");
const getGameCount_controller_1 = __webpack_require__(/*! ./getGameCount/getGameCount.controller */ "./apps/api/src/app/controllers/getGameCount/getGameCount.controller.ts");
const getUser_service_1 = __webpack_require__(/*! ./getUser/getUser.service */ "./apps/api/src/app/controllers/getUser/getUser.service.ts");
const getUsers_service_1 = __webpack_require__(/*! ./getUsers/getUsers.service */ "./apps/api/src/app/controllers/getUsers/getUsers.service.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const getGames_service_1 = __webpack_require__(/*! ./getGames/getGames.service */ "./apps/api/src/app/controllers/getGames/getGames.service.ts");
const getDeals_controller_1 = __webpack_require__(/*! ./getDeals/getDeals.controller */ "./apps/api/src/app/controllers/getDeals/getDeals.controller.ts");
const getDeals_service_1 = __webpack_require__(/*! ./getDeals/getDeals.service */ "./apps/api/src/app/controllers/getDeals/getDeals.service.ts");
const getGameCount_service_1 = __webpack_require__(/*! ./getGameCount/getGameCount.service */ "./apps/api/src/app/controllers/getGameCount/getGameCount.service.ts");
let ControllersModule = class ControllersModule {
};
ControllersModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Game', schema: api_mongoose_models_1.GameSchema },
                { name: 'Deal', schema: api_mongoose_models_1.DealSchema },
                { name: 'User', schema: api_mongoose_models_1.UserSchema },
            ]),
        ],
        controllers: [
            getUser_controller_1.GetUserController,
            getUsers_controller_1.GetUsersController,
            getGames_controller_1.GetGamesController,
            getDeals_controller_1.GetDealsController,
            getGameCount_controller_1.GetGameCountController,
        ],
        providers: [
            getUser_service_1.GetUserService,
            getUsers_service_1.GetUsersService,
            getGames_service_1.GetGamesService,
            getDeals_service_1.GetDealsService,
            getGameCount_service_1.GetGameCountService,
        ],
    })
], ControllersModule);
exports.ControllersModule = ControllersModule;


/***/ }),

/***/ "./apps/api/src/app/controllers/getDeals/getDeals.controller.ts":
/*!**********************************************************************!*\
  !*** ./apps/api/src/app/controllers/getDeals/getDeals.controller.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDealsController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
const getDeals_service_1 = __webpack_require__(/*! ./getDeals.service */ "./apps/api/src/app/controllers/getDeals/getDeals.service.ts");
let GetDealsController = class GetDealsController {
    constructor(getDealsService) {
        this.getDealsService = getDealsService;
    }
    getDeals(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getDealsService.getDeals(userId);
        });
    }
    getDeal(dealId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getDealsService.getDeal(dealId);
        });
    }
    getDealsInfo(requestedDeals) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('deals------------------------------------------------');
            return yield this.getDealsService.getDealsInfo(requestedDeals);
        });
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Query(constants_1.USER_ID_STRING)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _a : Object)
], GetDealsController.prototype, "getDeals", null);
tslib_1.__decorate([
    common_1.Get(':dealId'),
    tslib_1.__param(0, common_1.Param('dealId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _b : Object)
], GetDealsController.prototype, "getDeal", null);
tslib_1.__decorate([
    common_1.Post(),
    tslib_1.__param(0, common_1.Body(constants_1.DEALS_STRING)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof interfaces_and_types_1.DealRequest !== "undefined" && interfaces_and_types_1.DealRequest) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _d : Object)
], GetDealsController.prototype, "getDealsInfo", null);
GetDealsController = tslib_1.__decorate([
    common_2.Controller(constants_1.GET_DEALS_CONTROLLER_STRING),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof getDeals_service_1.GetDealsService !== "undefined" && getDeals_service_1.GetDealsService) === "function" ? _e : Object])
], GetDealsController);
exports.GetDealsController = GetDealsController;


/***/ }),

/***/ "./apps/api/src/app/controllers/getDeals/getDeals.service.ts":
/*!*******************************************************************!*\
  !*** ./apps/api/src/app/controllers/getDeals/getDeals.service.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDealsService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const core_1 = __webpack_require__(/*! @angular/core */ "@angular/core");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
let GetDealsService = class GetDealsService {
    constructor(DealsModel) {
        this.DealsModel = DealsModel;
        this.shouldReturnScoringDefault = true;
    }
    getDeals(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                return new Promise((res, rej) => {
                    res({ message: "Invalid user id given in getDeals", status: 400 });
                });
            }
            else {
                const deals = yield this.DealsModel.find({ players: userId });
                return this.removeUnnecessaryDataFromDeals(deals, null);
            }
        });
    }
    getDeal(requestedDeal) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!requestedDeal) {
                return new Promise((res, rej) => {
                    res({ message: "Invalid deal id given in getDeal", status: 400 });
                });
            }
            else {
                const deal = yield this.DealsModel.findOne({ _id: requestedDeal });
                return this.getNewDeal(deal);
            }
        });
    }
    getDealsInfo(requestedDeals) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                console.log('requestedDeals =', requestedDeals);
                if (!requestedDeals)
                    return this.getErrorResponse();
                const dealsAsStrings = Object.keys(requestedDeals);
                const mongooseObjs = constants_1.getMongooseObjsFromRequestedDeals(dealsAsStrings);
                console.log('mongooseObjs =', mongooseObjs);
                const dealsToReturn = yield this.DealsModel.find({ _id: { $in: mongooseObjs } });
                return this.removeUnnecessaryDataFromDeals(dealsToReturn, requestedDeals);
            }
            catch (err) {
                return this.getErrorResponse();
            }
        });
    }
    getErrorResponse() {
        return new Promise((res, rej) => {
            res({ message: "Error in getDealsInfo", status: 400 });
        });
    }
    getNewDeal(deal, shouldAddScoring = this.shouldReturnScoringDefault) {
        const newDeal = {
            bids: deal.bids,
            contract: deal.contract,
            cardPlayOrder: deal.cardPlayOrder,
            dealer: deal.dealer,
            declarer: deal.declarer,
            doubleValue: deal.doubleValue,
            hands: deal.hands,
            roundWinners: deal.roundWinners,
            _id: deal._id,
        };
        if (shouldAddScoring) {
            newDeal['northSouth'] = deal.northSouth;
            newDeal['eastWest'] = deal.eastWest;
        }
        return newDeal;
    }
    removeUnnecessaryDataFromDeals(deals, requestedDeals) {
        const toReturn = {};
        for (let i = 0; i < deals.length; i++) {
            const deal = deals[i];
            const shouldAddScoring = requestedDeals[deal._id];
            const newDeal = this.getNewDeal(deal, shouldAddScoring);
            toReturn[deal._id] = newDeal;
        }
        return toReturn;
    }
};
GetDealsService = tslib_1.__decorate([
    core_1.Injectable({ providedIn: 'root' }),
    tslib_1.__param(0, mongoose_1.InjectModel('Deal')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], GetDealsService);
exports.GetDealsService = GetDealsService;


/***/ }),

/***/ "./apps/api/src/app/controllers/getGameCount/getGameCount.controller.ts":
/*!******************************************************************************!*\
  !*** ./apps/api/src/app/controllers/getGameCount/getGameCount.controller.ts ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGameCountController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
const getGameCount_service_1 = __webpack_require__(/*! ./getGameCount.service */ "./apps/api/src/app/controllers/getGameCount/getGameCount.service.ts");
let GetGameCountController = class GetGameCountController {
    constructor(getGameCountService) {
        this.getGameCountService = getGameCountService;
    }
    getGameCount(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getGameCountService.getGameCount(userId);
        });
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Query(constants_1.USER_ID_STRING)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _a : Object)
], GetGameCountController.prototype, "getGameCount", null);
GetGameCountController = tslib_1.__decorate([
    common_2.Controller(constants_1.GET_GAME_COUNT_CONTROLLER_STRING),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof getGameCount_service_1.GetGameCountService !== "undefined" && getGameCount_service_1.GetGameCountService) === "function" ? _b : Object])
], GetGameCountController);
exports.GetGameCountController = GetGameCountController;


/***/ }),

/***/ "./apps/api/src/app/controllers/getGameCount/getGameCount.service.ts":
/*!***************************************************************************!*\
  !*** ./apps/api/src/app/controllers/getGameCount/getGameCount.service.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGameCountService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const core_1 = __webpack_require__(/*! @angular/core */ "@angular/core");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let GetGameCountService = class GetGameCountService {
    constructor(gamesModel) {
        this.gamesModel = gamesModel;
    }
    getGameCount(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (userId === undefined || userId === null)
                    return this.getErrorResponse();
                return yield this.gamesModel.countDocuments({ players: userId });
            }
            catch (err) {
                console.log('err =', err);
                return this.getErrorResponse();
            }
        });
    }
    getErrorResponse() {
        return new Promise((res, rej) => {
            res({ message: 'Error in getGameCount', status: 400 });
        });
    }
};
GetGameCountService = tslib_1.__decorate([
    core_1.Injectable({ providedIn: 'root' }),
    tslib_1.__param(0, mongoose_1.InjectModel('Game')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], GetGameCountService);
exports.GetGameCountService = GetGameCountService;


/***/ }),

/***/ "./apps/api/src/app/controllers/getGames/getGames.controller.ts":
/*!**********************************************************************!*\
  !*** ./apps/api/src/app/controllers/getGames/getGames.controller.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGamesController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
const getGames_service_1 = __webpack_require__(/*! ./getGames.service */ "./apps/api/src/app/controllers/getGames/getGames.service.ts");
const constants_2 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
let GetGamesController = class GetGamesController {
    constructor(getGamesService) {
        this.getGamesService = getGamesService;
    }
    getGames(userId, lastGamesToGet) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getGamesService.getGames(userId, lastGamesToGet);
        });
    }
    getGame(gameId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getGamesService.getGame(gameId);
        });
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Query(constants_2.USER_ID_STRING)),
    tslib_1.__param(1, common_1.Query(constants_1.GET_GAMES_LAST_STRING)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _a : Object)
], GetGamesController.prototype, "getGames", null);
tslib_1.__decorate([
    common_1.Get(':gameId'),
    tslib_1.__param(0, common_1.Param('gameId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _b : Object)
], GetGamesController.prototype, "getGame", null);
GetGamesController = tslib_1.__decorate([
    common_2.Controller(constants_1.GET_GAMES_CONTROLLER_STRING),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof getGames_service_1.GetGamesService !== "undefined" && getGames_service_1.GetGamesService) === "function" ? _c : Object])
], GetGamesController);
exports.GetGamesController = GetGamesController;


/***/ }),

/***/ "./apps/api/src/app/controllers/getGames/getGames.service.ts":
/*!*******************************************************************!*\
  !*** ./apps/api/src/app/controllers/getGames/getGames.service.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGamesService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const core_1 = __webpack_require__(/*! @angular/core */ "@angular/core");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let GetGamesService = class GetGamesService {
    constructor(gamesModel) {
        this.gamesModel = gamesModel;
    }
    getGames(userId, lastGamesToGet) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (lastGamesToGet) {
                    const games = yield this.gamesModel.find({ players: userId }).sort({ completionDate: -1 }).limit(+lastGamesToGet).exec();
                    return this.removeUnnecessaryDataFromGames(games);
                }
                else {
                    const games = yield this.gamesModel.find({ players: userId }).exec();
                    return this.removeUnnecessaryDataFromGames(games);
                }
            }
            catch (err) {
                return this.getErrorResponse();
            }
        });
    }
    getGame(gameId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const game = yield this.gamesModel.findOne({ _id: gameId }).exec();
                return this.getNewGame(game);
            }
            catch (err) {
                console.log('err =', err);
                return new Promise((res, rej) => {
                    res({ message: "Error in getGame", status: 400 });
                });
            }
        });
    }
    getErrorResponse() {
        return new Promise((res, rej) => {
            res({ message: "Error in getGames", status: 400 });
        });
    }
    getNewGame(game) {
        const newRoom = {
            name: game.room.name,
            seating: game.room.seating,
        };
        const newGame = {
            deals: game.deals,
            players: game.players,
            completionDate: game.completionDate,
            room: newRoom,
            _id: game._id,
        };
        return newGame;
    }
    removeUnnecessaryDataFromGames(games) {
        const toReturn = [];
        // -only send back relevant info on each game (deals,players, completionDate, room.name, room.seating, _id)
        for (let i = 0; i < games.length; i++) {
            const game = games[i];
            const newGame = this.getNewGame(game);
            toReturn.push(newGame);
        }
        return toReturn;
    }
};
GetGamesService = tslib_1.__decorate([
    core_1.Injectable({ providedIn: 'root' }),
    tslib_1.__param(0, mongoose_1.InjectModel('Game')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], GetGamesService);
exports.GetGamesService = GetGamesService;


/***/ }),

/***/ "./apps/api/src/app/controllers/getUser/getUser.controller.ts":
/*!********************************************************************!*\
  !*** ./apps/api/src/app/controllers/getUser/getUser.controller.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
const getUser_service_1 = __webpack_require__(/*! ./getUser.service */ "./apps/api/src/app/controllers/getUser/getUser.service.ts");
let GetUserController = class GetUserController {
    constructor(getUserService) {
        this.getUserService = getUserService;
    }
    getData(username, email) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getUserService.getUser(username, email);
        });
    }
};
tslib_1.__decorate([
    common_1.Post(),
    tslib_1.__param(0, common_1.Body(constants_1.USERNAME_STRING)),
    tslib_1.__param(1, common_1.Body(constants_1.EMAIL_STRING)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _a : Object)
], GetUserController.prototype, "getData", null);
GetUserController = tslib_1.__decorate([
    common_2.Controller(constants_1.GET_USER_CONTROLLER_STRING),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof getUser_service_1.GetUserService !== "undefined" && getUser_service_1.GetUserService) === "function" ? _b : Object])
], GetUserController);
exports.GetUserController = GetUserController;


/***/ }),

/***/ "./apps/api/src/app/controllers/getUser/getUser.service.ts":
/*!*****************************************************************!*\
  !*** ./apps/api/src/app/controllers/getUser/getUser.service.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const core_1 = __webpack_require__(/*! @angular/core */ "@angular/core");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const api_errors_1 = __webpack_require__(/*! @nx-bridge/api-errors */ "./libs/api-errors/src/index.ts");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let GetUserService = class GetUserService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    getUser(username, email) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const error = this.validateInputs(username, email);
                if (error)
                    return error;
                const response = (yield this.queryDB(username, email));
                if (response)
                    return { id: response._id, username: response.username };
                return response;
            }
            catch (err) {
                return this.getErrorResponse();
            }
        });
    }
    validateInputs(username, email) {
        if (!email && !username) {
            return { message: api_errors_1.INVALID_CREDENTIALS, status: 400 };
        }
        return null;
    }
    queryDB(username, email) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (username)
                return yield this.getUserFromUserName(username);
            else if (email)
                return yield this.getUserFromEmail(email);
        });
    }
    getUserFromUserName(username) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findOne({ username }).exec();
        });
    }
    getUserFromEmail(email) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findOne({ email }).exec();
        });
    }
    getErrorResponse() {
        return new Promise((res, rej) => {
            res({ message: 'Error in getUser', status: 400 });
        });
    }
};
GetUserService = tslib_1.__decorate([
    core_1.Injectable({ providedIn: 'root' }),
    tslib_1.__param(0, mongoose_1.InjectModel('User')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], GetUserService);
exports.GetUserService = GetUserService;


/***/ }),

/***/ "./apps/api/src/app/controllers/getUsers/getUsers.controller.ts":
/*!**********************************************************************!*\
  !*** ./apps/api/src/app/controllers/getUsers/getUsers.controller.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
const getUsers_service_1 = __webpack_require__(/*! ./getUsers.service */ "./apps/api/src/app/controllers/getUsers/getUsers.service.ts");
let GetUsersController = class GetUsersController {
    constructor(getUsersService) {
        this.getUsersService = getUsersService;
    }
    getData(users) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getUsersService.getUsers(users);
        });
    }
};
tslib_1.__decorate([
    common_1.Post(),
    tslib_1.__param(0, common_1.Body(constants_1.USERS_STRING)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof interfaces_and_types_1.ControllerResponse !== "undefined" && interfaces_and_types_1.ControllerResponse) === "function" ? _a : Object)
], GetUsersController.prototype, "getData", null);
GetUsersController = tslib_1.__decorate([
    common_2.Controller(constants_1.GET_USERS_CONTROLLER_STRING),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof getUsers_service_1.GetUsersService !== "undefined" && getUsers_service_1.GetUsersService) === "function" ? _b : Object])
], GetUsersController);
exports.GetUsersController = GetUsersController;


/***/ }),

/***/ "./apps/api/src/app/controllers/getUsers/getUsers.service.ts":
/*!*******************************************************************!*\
  !*** ./apps/api/src/app/controllers/getUsers/getUsers.service.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const core_1 = __webpack_require__(/*! @angular/core */ "@angular/core");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const api_errors_1 = __webpack_require__(/*! @nx-bridge/api-errors */ "./libs/api-errors/src/index.ts");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
let GetUsersService = class GetUsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    getUsers(users) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const error = this.validateInputs(users);
                if (error)
                    return error;
                return yield this.queryDB(users);
            }
            catch (err) {
                console.log('err =', err);
                this.getErrorResponse();
            }
        });
    }
    validateInputs(users) {
        if (!users || users.length < 0) {
            return { message: api_errors_1.INVALID_USERS_ARRAY, status: 400 };
        }
        return null;
    }
    queryDB(users) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mongooseObjs = constants_1.getMongooseObjsFromRequestedDeals(users);
            const response = yield this.userModel.find({ _id: { $in: mongooseObjs } });
            // const newResponse = response.map(userObj => {return {...(userObj as any)._doc, salt: null, hash: null, email: null, resetPasswordToken: null} as User})
            return response.map(userObj => {
                return { [userObj._id]: userObj.username };
            });
        });
    }
    getErrorResponse() {
        return new Promise((res, rej) => {
            res({ message: 'Error in getUsers()', status: 400 });
        });
    }
};
GetUsersService = tslib_1.__decorate([
    core_1.Injectable({ providedIn: 'root' }),
    tslib_1.__param(0, mongoose_1.InjectModel('User')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], GetUsersService);
exports.GetUsersService = GetUsersService;


/***/ }),

/***/ "./apps/api/src/main.ts":
/*!******************************!*\
  !*** ./apps/api/src/main.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app/app.module */ "./apps/api/src/app/app.module.ts");
function bootstrap() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        const globalPrefix = 'api';
        app.enableCors();
        app.setGlobalPrefix(globalPrefix);
        const port = process.env.PORT || 3333;
        yield app.listen(port, () => {
            common_1.Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
        });
    });
}
bootstrap();


/***/ }),

/***/ "./libs/api-errors/src/index.ts":
/*!**************************************!*\
  !*** ./libs/api-errors/src/index.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
tslib_1.__exportStar(__webpack_require__(/*! ./lib/api-errors */ "./libs/api-errors/src/lib/api-errors.ts"), exports);


/***/ }),

/***/ "./libs/api-errors/src/lib/api-errors.ts":
/*!***********************************************!*\
  !*** ./libs/api-errors/src/lib/api-errors.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_APPENDING_GAMES = exports.INVALID_USERS_ARRAY = exports.INVALID_CREDENTIALS = void 0;
exports.INVALID_CREDENTIALS = 'Please enter a valid username or email.';
exports.INVALID_USERS_ARRAY = 'Please enter a valid list of userId strings';
exports.ERROR_APPENDING_GAMES = 'Error appending games to localStorageUser';


/***/ }),

/***/ "./libs/api-mongoose-models/src/index.ts":
/*!***********************************************!*\
  !*** ./libs/api-mongoose-models/src/index.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
tslib_1.__exportStar(__webpack_require__(/*! ./lib/api-mongoose-models */ "./libs/api-mongoose-models/src/lib/api-mongoose-models.ts"), exports);


/***/ }),

/***/ "./libs/api-mongoose-models/src/lib/api-mongoose-models.ts":
/*!*****************************************************************!*\
  !*** ./libs/api-mongoose-models/src/lib/api-mongoose-models.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.GameSchema = exports.DealSchema = void 0;
const mongoose = __webpack_require__(/*! mongoose */ "mongoose");
exports.DealSchema = new mongoose.Schema({
    players: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    cardPlayOrder: [
        { type: Array, default: [] },
    ],
    hands: {},
    roundWinners: [
        { type: Array, default: [] },
    ],
    declarer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    bids: [
        { type: Array, default: [] },
    ],
    contract: { type: String, default: "" },
    northSouth: {
        aboveTheLine: { type: Number, default: 0 },
        belowTheLine: { type: Number, default: 0 },
        totalBelowTheLineScore: { type: Number, default: 0 },
        isVulnerable: { type: Boolean, default: false },
        vulnerableTransitionIndex: { type: Number, default: null },
    },
    eastWest: {
        aboveTheLine: { type: Number, default: 0 },
        belowTheLine: { type: Number, default: 0 },
        totalBelowTheLineScore: { type: Number, default: 0 },
        isVulnerable: { type: Boolean, default: false },
        vulnerableTransitionIndex: { type: Number, default: null },
    },
    redealCount: { type: Number, default: 0 },
    dealSummary: {
        contractPoints: { type: Number, default: 0 },
        overTrickPoints: { type: Number, default: 0 },
        underTrickPoints: { type: Number, default: 0 },
        rubberBonus: { type: Number, default: 0 },
        honorPoints: { type: Number, default: null },
    },
    doubleValue: { type: Number, default: null },
});
exports.GameSchema = new mongoose.Schema({
    deals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deal",
        },
    ],
    room: {},
    //winner is the team whose last item is >= 100 in gameRoundEndingScores
    gameRoundEndingScores: {
        northSouth: [],
        eastWest: [],
    },
    startDate: { type: Number, default: Date.now() },
    completionDate: { type: Number, default: Date.now() },
    players: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    points: {},
});
exports.UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, unique: false, required: false },
    email: { type: String, unique: true, required: true },
    // zipCode: {type: Number, unique: false, required: false},
    preferences: {
        sound: {
            isEnabled: { type: Boolean, default: false },
            defaultVolume: { type: Number, default: .15 },
            shotgunLoad: { type: String, default: 'shotgunLoad' },
            isYourTurnHand: { type: String, default: 'gongFull' },
            isYourTurnExposed: { type: String, default: 'beepFourTimes' },
            userPlaysCard: { type: String, default: 'plop1' },
            cardPlayDuring: { type: String, default: 'boomerang' },
            roundEndAnimation: { type: String, default: 'none' },
            roundWon: { type: String, default: 'laugh1' },
            dealSummaryWon: { type: String, default: 'none' },
            dealSummaryLost: { type: String, default: 'none' },
            gameSummaryWon: { type: String, default: 'none' },
            gameSummaryLost: { type: String, default: 'none' },
            // roundLost: {type: String, default: 'roundLost'},
        },
        cardSortPreference: { type: String, default: "Descending" },
        suitSortPreference: { type: String, default: "Descending" },
        trumpOnLeftHand: { type: Boolean, default: true },
        trumpOnLeftExposedHand: { type: Boolean, default: true },
        shouldAnimateThinkingForSelf: { type: Boolean, default: true },
        shouldAnimateCardPlay: { type: Boolean, default: true },
        shouldAnimateRoundEnd: { type: Boolean, default: true },
        pointCountingConvention: { type: String, default: "HCP" },
        cardBackPreference: { type: Number, default: 4 },
        colorTheme: { type: String, default: "darkBlue" },
        setHonorsAutomatically: { type: Boolean, default: false },
    },
    date: { type: Number, default: Date.now() },
    emailValidated: { type: Boolean, default: false },
    hasPaid: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    stats: {
        totalPoints: {
            distribution: { type: Number, default: 0 },
            highCard: { type: Number, default: 0 },
        },
        maximums: {
            distribution: { type: Number, default: 0 },
            highCard: { type: Number, default: 0 },
            combined: {
                highCard: { type: Number, default: 0 },
                distribution: { type: Number, default: 0 },
            }
        },
        gamesPlayed: { type: Number, default: 0 },
        gamesWon: { type: Number, default: 0 },
        dealsPlayed: { type: Number, default: 0 },
        dealsPlayedAsDeclarer: { type: Number, default: 0 },
        dealsPlayedAsDefense: { type: Number, default: 0 },
        dealsWon: { type: Number, default: 0 },
        dealsWonAsDeclarer: { type: Number, default: 0 },
        dealsWonAsDefense: { type: Number, default: 0 },
        dealsDoubled: { type: Number, default: 0 },
        dealsWonDoubled: { type: Number, default: 0 },
        ties: { type: Number, default: 0 },
    },
});


/***/ }),

/***/ "./libs/constants/constants.ts":
/*!*************************************!*\
  !*** ./libs/constants/constants.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.gameDetailHeightAboveBreakpointCssPropName = exports.ANIMATION_DURATION = exports.MOBILE_START_WIDTH = exports.dealDetailButtonChoices = exports.dealsListDetailsButtonChoices = exports.dealsListDealsButtonChoices = exports.DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME = exports.GAME_DETAIL_BORDER_BOTTOM_CLASSNAME = exports.HEADER_CLASSNAME = exports.COLOR_BLACK_CLASSNAME = exports.COLOR_RED_CLASSNAME = exports.FULL_SIZE_CLASSNAME = exports.FILTER_MANAGER_CLASSNAME = exports.DEAL_PLAYER_CLASSNAME = exports.GAMES_VIEW_CLASSNAME = exports.GAME_DETAIL_CLASSNAME = exports.DEAL_DETAIL_CLASSNAME = exports.DEALS_LIST_CLASSNAME = exports.LOGIN_CARD_CLASSNAME = exports.MATCHED_DEAL_CLASSNAME = exports.DISPLAY_NONE_CLASSNAME = exports.VISIBLE_CLASSNAME = exports.TRANSLATE_UP_CLASSNAME = exports.TRANSLATE_RIGHT_CLASSNAME = exports.TRANSLATE_LEFT_CLASSNAME = exports.SCALE_X_NONE_CLASSNAME = exports.SCALE_Y_NONE_CLASSNAME = exports.OPACITY_NONE_CLASSNAME = exports.HIDDEN_CLASSNAME = exports.HEIGHT_NONE_CLASSNAME = exports.HEIGHT_AUTO_CLASSNAME = exports.OVERFLOW_Y_SCROLL_CLASSNAME = exports.GET_USERS_URL = exports.GET_USER_URL = exports.GET_GAME_COUNT_URL = exports.GET_GAMES_URL = exports.GET_DEALS_URL = exports.DEAL_PASSED_OUT_MESSAGE = exports.USERS_STRING = exports.EMAIL_STRING = exports.USERNAME_STRING = exports.DEALS_STRING = exports.GET_GAMES_LAST_STRING = exports.USER_ID_STRING = exports.GET_USERS_CONTROLLER_STRING = exports.GET_USER_CONTROLLER_STRING = exports.GET_GAME_COUNT_CONTROLLER_STRING = exports.GET_GAMES_CONTROLLER_STRING = exports.GET_DEALS_CONTROLLER_STRING = exports.rootRoute = void 0;
exports.COMPARER_HTML_ENTITIES = exports.filterManagerDoubleOptions = exports.filterManagerGameNames = exports.filterManagerPlayerNames = exports.filterManagerCardsAsNumbers = exports.filterManagerBids = exports.filterManagerContracts = exports.NOT_AVAILABLE_STRING = exports.RESULTS_PER_PAGE_OPTIONS = exports.SORT_OPTIONS = exports.SIZE_OPTIONS = exports.dealDetailButtonBorder = exports.gameDetailBorderClosed = exports.gameDetailBorderOpen = exports.colorPrimary4CssPropName = exports.colorPrimary1CssPropName = exports.colorBlackCssPropName = exports.gameDetailBorderCssPropName = exports.dealsListButtonFontSizeCssPropName = exports.playerNamesDisplayTypeCssPropName = exports.playerLabelsDisplayTypeCssPropName = exports.gameDetailSummaryHeightPercentageCssPropName = exports.gameDetailHeightBelowBreakpointCssPropName = void 0;
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
exports.rootRoute = 'replays';
exports.GET_DEALS_CONTROLLER_STRING = 'getDeals';
exports.GET_GAMES_CONTROLLER_STRING = 'getGames';
exports.GET_GAME_COUNT_CONTROLLER_STRING = 'getGameCount';
exports.GET_USER_CONTROLLER_STRING = 'getUser';
exports.GET_USERS_CONTROLLER_STRING = 'getUsers';
exports.USER_ID_STRING = 'userId';
exports.GET_GAMES_LAST_STRING = 'last';
exports.DEALS_STRING = 'deals';
exports.USERNAME_STRING = 'username';
exports.EMAIL_STRING = 'email';
exports.USERS_STRING = 'users';
exports.DEAL_PASSED_OUT_MESSAGE = 'Deal passed out';
exports.GET_DEALS_URL = `/api/${exports.GET_DEALS_CONTROLLER_STRING}`;
exports.GET_GAMES_URL = `/api/${exports.GET_GAMES_CONTROLLER_STRING}`;
exports.GET_GAME_COUNT_URL = `/api/${exports.GET_GAME_COUNT_CONTROLLER_STRING}`;
exports.GET_USER_URL = `/api/${exports.GET_USER_CONTROLLER_STRING}`;
exports.GET_USERS_URL = `/api/${exports.GET_USERS_CONTROLLER_STRING}`;
exports.OVERFLOW_Y_SCROLL_CLASSNAME = 'overflow-y-auto';
exports.HEIGHT_AUTO_CLASSNAME = 'h-auto';
exports.HEIGHT_NONE_CLASSNAME = 'h-0';
exports.HIDDEN_CLASSNAME = 'hidden';
exports.OPACITY_NONE_CLASSNAME = 'opacity-none';
exports.SCALE_Y_NONE_CLASSNAME = 'scale-y-none';
exports.SCALE_X_NONE_CLASSNAME = 'scale-x-none';
exports.TRANSLATE_LEFT_CLASSNAME = 'translate-left';
exports.TRANSLATE_RIGHT_CLASSNAME = 'translate-right';
exports.TRANSLATE_UP_CLASSNAME = 'translate-up';
exports.VISIBLE_CLASSNAME = 'visible';
exports.DISPLAY_NONE_CLASSNAME = 'd-none';
exports.MATCHED_DEAL_CLASSNAME = 'matched-deal';
exports.LOGIN_CARD_CLASSNAME = 'login-card';
exports.DEALS_LIST_CLASSNAME = 'deals-list';
exports.DEAL_DETAIL_CLASSNAME = 'deal-detail';
exports.GAME_DETAIL_CLASSNAME = 'game-detail';
exports.GAMES_VIEW_CLASSNAME = 'games-view';
exports.DEAL_PLAYER_CLASSNAME = 'deal-player';
exports.FILTER_MANAGER_CLASSNAME = 'filter-manager';
exports.FULL_SIZE_CLASSNAME = 'full-size';
exports.COLOR_RED_CLASSNAME = 'color-red';
exports.COLOR_BLACK_CLASSNAME = 'color-black';
exports.HEADER_CLASSNAME = 'navbar';
exports.GAME_DETAIL_BORDER_BOTTOM_CLASSNAME = 'game-detail-border-bottom';
exports.DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME = 'deal-detail-button-border-bottom';
exports.dealsListDealsButtonChoices = [
    'Open',
    '&#10006;',
];
exports.dealsListDetailsButtonChoices = [
    'Show All',
    'Hide All',
];
exports.dealDetailButtonChoices = ['Show', 'Hide'];
exports.MOBILE_START_WIDTH = 561;
exports.ANIMATION_DURATION = 500;
exports.gameDetailHeightAboveBreakpointCssPropName = '--game-detail-height-above-breakpoint';
exports.gameDetailHeightBelowBreakpointCssPropName = '--game-detail-height-below-breakpoint';
exports.gameDetailSummaryHeightPercentageCssPropName = '--game-detail-summary-height-percentage';
exports.playerLabelsDisplayTypeCssPropName = '--player-labels-display-type';
exports.playerNamesDisplayTypeCssPropName = '--player-names-display-type';
exports.dealsListButtonFontSizeCssPropName = '--deals-list-button-font-size';
exports.gameDetailBorderCssPropName = '--game-detail-border';
exports.colorBlackCssPropName = '--color-black-rgb';
exports.colorPrimary1CssPropName = '--color-primary-1-rgb';
exports.colorPrimary4CssPropName = '--color-primary-4-rgb';
exports.gameDetailBorderOpen = `1px solid rgba(var(${exports.colorBlackCssPropName}), 1)`;
exports.gameDetailBorderClosed = `2px solid rgba(var(${exports.colorPrimary4CssPropName}), .25)`;
exports.dealDetailButtonBorder = `1px solid rgba(var(${exports.colorPrimary1CssPropName}), 0.5) !important;`;
exports.SIZE_OPTIONS = {
    [interfaces_and_types_1.GameDetailSizes.small]: interfaces_and_types_1.GameDetailSizes.small,
    [interfaces_and_types_1.GameDetailSizes.medium]: interfaces_and_types_1.GameDetailSizes.medium,
    [interfaces_and_types_1.GameDetailSizes.large]: interfaces_and_types_1.GameDetailSizes.large,
};
exports.SORT_OPTIONS = {
    [interfaces_and_types_1.SortOptions.ascending]: interfaces_and_types_1.SortOptions.ascending,
    [interfaces_and_types_1.SortOptions.descending]: interfaces_and_types_1.SortOptions.descending,
};
exports.RESULTS_PER_PAGE_OPTIONS = [1, 2, 5, 10, 25, 50, 100];
exports.NOT_AVAILABLE_STRING = 'N/A';
exports.filterManagerContracts = ['Pick a Contract'];
exports.filterManagerBids = ['Pick a Bid'];
exports.filterManagerCardsAsNumbers = ['Pick a Card', ...Array(52).keys()];
exports.filterManagerPlayerNames = ['Pick a Username'];
exports.filterManagerGameNames = ['Pick a Game Name'];
exports.filterManagerDoubleOptions = ['Pick a Multiplier', 'Once', 'Twice'];
exports.COMPARER_HTML_ENTITIES = {
    lessThanEqualTo: "&#8804;",
    greaterThanEqualTo: "&#8805;",
};


/***/ }),

/***/ "./libs/constants/functions.ts":
/*!*************************************!*\
  !*** ./libs/constants/functions.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForParentOfType = exports.getAmountMadeAndNeededFromDeal = exports.getPlayingPlayers = exports.getContractAsHtmlEntityString = exports.getHtmlEntityFromContract = exports.getHtmlEntityFromCard = exports.resetMatchedDeals = exports.getDateAndTimeString = exports.getNewBatchNumber = exports.getNewTotalNumberOfPages = exports.paginateGames = exports.sortAscending = exports.sortDescending = exports.scrollToSection = exports.getLinearPercentOfMaxMatchWithinRange = exports.getDeclarerFromDeal = exports.toggleInnerHTML = exports.toggleClassOnList = exports.setValueInLocalStorage = exports.getValueFromLocalStorage = exports.getMongooseObjsFromRequestedDeals = exports.capitalize = void 0;
const store_1 = __webpack_require__(/*! @nx-bridge/store */ "./libs/store/src/index.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
const mongoose = __webpack_require__(/*! mongoose */ "mongoose");
const functions_1 = __webpack_require__(/*! ./playing/functions */ "./libs/constants/playing/functions.ts");
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const constants_2 = __webpack_require__(/*! ./constants */ "./libs/constants/constants.ts");
const constants_3 = __webpack_require__(/*! ./playing/constants */ "./libs/constants/playing/constants.ts");
function capitalize(str) {
    return str
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');
}
exports.capitalize = capitalize;
function getMongooseObjsFromRequestedDeals(requestedDeals) {
    const mongooseObjs = [];
    for (let i = 0; i < requestedDeals.length; i++) {
        const deal = requestedDeals[i];
        mongooseObjs.push(mongoose.Types.ObjectId(deal));
    }
    return mongooseObjs;
}
exports.getMongooseObjsFromRequestedDeals = getMongooseObjsFromRequestedDeals;
function getValueFromLocalStorage(value) {
    return JSON.parse(localStorage.getItem(value));
}
exports.getValueFromLocalStorage = getValueFromLocalStorage;
function setValueInLocalStorage(value, valueToSet) {
    return localStorage.setItem(value, JSON.stringify(valueToSet));
}
exports.setValueInLocalStorage = setValueInLocalStorage;
function toggleClassOnList(items, classListToToggle) {
    var _a;
    let result = null;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        result = (_a = item === null || item === void 0 ? void 0 : item.classList) === null || _a === void 0 ? void 0 : _a.toggle(classListToToggle);
    }
    return result;
}
exports.toggleClassOnList = toggleClassOnList;
function toggleInnerHTML(element, choices) {
    if (!element || !choices)
        return;
    if (element.innerHTML.match(choices[0]))
        element.innerHTML = choices[1];
    else
        element.innerHTML = choices[0];
}
exports.toggleInnerHTML = toggleInnerHTML;
function getDeclarerFromDeal(deal) {
    if (!deal.declarer)
        return constants_2.NOT_AVAILABLE_STRING;
    for (let i = (deal === null || deal === void 0 ? void 0 : deal.bids.length) - 1; i >= 0; i--) {
        const bid = deal === null || deal === void 0 ? void 0 : deal.bids[i][1];
        if (functions_1.getIsBidPlayable(bid)) {
            return deal === null || deal === void 0 ? void 0 : deal.bids[i][0];
        }
    }
    return 'Error in getDeclarerFromDeal()';
}
exports.getDeclarerFromDeal = getDeclarerFromDeal;
function getLinearPercentOfMaxMatchWithinRange(currentTrackedValue, minTrackedValue, maxTrackedValue, startOutputValue, endOutputValue) {
    //returns a value between a given input range that correlates to the value of variable as it changes within a different range.  If the tracked variable goes about the maxCutoff then it assumes the max value possible.  If it goes anywhere below the min value.  Any where inbetween is linearly correlated to the trackedValue.
    if (currentTrackedValue >= maxTrackedValue)
        return endOutputValue;
    if (currentTrackedValue <= minTrackedValue)
        return startOutputValue;
    var trackedValueRange = Math.abs(maxTrackedValue - minTrackedValue);
    var outputValueRange = Math.abs(endOutputValue - startOutputValue);
    var amountAboveMin = currentTrackedValue - minTrackedValue;
    var percentOfRange = amountAboveMin / trackedValueRange;
    if (startOutputValue <= endOutputValue)
        return startOutputValue + percentOfRange * outputValueRange;
    else {
        return startOutputValue - percentOfRange * outputValueRange;
    }
}
exports.getLinearPercentOfMaxMatchWithinRange = getLinearPercentOfMaxMatchWithinRange;
const scrollToSection = (sectionToScrollTo, headerHeight, isScrollableContainer = false) => {
    const topScrollAmount = window.scrollY +
        sectionToScrollTo.getBoundingClientRect().top -
        headerHeight;
    if (isScrollableContainer)
        return topScrollAmount;
    return window.scroll({
        top: topScrollAmount,
        left: 0,
        behavior: 'smooth',
    });
};
exports.scrollToSection = scrollToSection;
function sortDescending(games) {
    //todo: look up which sorting algorithm to use
    games.reverse();
}
exports.sortDescending = sortDescending;
function sortAscending(games) {
    //todo: look up which sorting algorithm to use
    // games.reverse();
}
exports.sortAscending = sortAscending;
function paginateGames(games, sortPreference, batchNumber, numberPerBatch) {
    //note: batchNumber starts at 0
    if (!games || games.length <= 0)
        return [];
    const batchStart = numberPerBatch * batchNumber;
    const batchEnd = batchStart + numberPerBatch;
    let toReturnGames = [];
    if (sortPreference === interfaces_and_types_1.SortOptions.descending)
        toReturnGames = games.slice(batchStart, batchEnd);
    else {
        for (let i = 0; i < games.length; i++) {
            const game = games[games.length - 1 - i];
            if (i >= batchStart && i < batchEnd)
                toReturnGames.push(game);
        }
    }
    return toReturnGames;
}
exports.paginateGames = paginateGames;
function getNewTotalNumberOfPages(resultsPerPage, totalGames) {
    return Math.ceil(totalGames / resultsPerPage);
}
exports.getNewTotalNumberOfPages = getNewTotalNumberOfPages;
function getNewBatchNumber(currentBatchNumber, currentResultsPerPage, newResultsPerPage, totalGames) {
    const maxNumberOfIterations = Math.ceil(totalGames / newResultsPerPage);
    const currentMinResult = currentBatchNumber * currentResultsPerPage;
    const currentMaxResult = currentMinResult + (currentResultsPerPage - 1);
    if (newResultsPerPage === currentResultsPerPage)
        return currentBatchNumber;
    // if (newResultsPerPage > currentResultsPerPage) {
    //when going up in resultsPerPage
    for (let i = 0; i < maxNumberOfIterations; i++) {
        const newMinResult = i * newResultsPerPage;
        const newMaxResult = newMinResult + (newResultsPerPage - 1);
        if (currentMinResult >= newMinResult && currentMinResult <= newMaxResult) {
            return i;
        }
    }
    return 0;
    // } else if (newResultsPerPage < currentResultsPerPage) {
    //when going down in resultsPerPage
    // }
}
exports.getNewBatchNumber = getNewBatchNumber;
function getDateAndTimeString(filterName, filterMsg) {
    if (!(filterName === null || filterName === void 0 ? void 0 : filterName.date))
        return constants_2.NOT_AVAILABLE_STRING;
    const date = filterName.date.toLocaleDateString();
    const shortDate = date.substr(0, date.length - 4) + date.substr(date.length - 2, date.length);
    const time = filterName.date.toLocaleTimeString();
    const shortTime = time.replace(/(:\d{2}) .*$/i, '');
    const amOrPm = time.substr(-2, 2);
    return `${filterMsg}${shortTime}${amOrPm} on ${shortDate}`;
}
exports.getDateAndTimeString = getDateAndTimeString;
function resetMatchedDeals() {
    const matched = document.querySelectorAll(`.${constants_1.MATCHED_DEAL_CLASSNAME}`);
    for (let i = 0; i < matched.length; i++) {
        const match = matched[i];
        match.classList.remove(constants_1.MATCHED_DEAL_CLASSNAME);
    }
}
exports.resetMatchedDeals = resetMatchedDeals;
function getHtmlEntityFromCard(card) {
    const number = +card;
    if (isNaN(number))
        return `${card}`;
    const htmlEntity = functions_1.getHtmlEntityFromSuitOrCardAsNumber(number);
    const char = functions_1.getCharacterFromCardAsNumber(number, true);
    return `${char}${htmlEntity}`;
}
exports.getHtmlEntityFromCard = getHtmlEntityFromCard;
function getHtmlEntityFromContract(contract) {
    const clubString = constants_3.suitsAsCapitalizedStrings[0].substr(0, constants_3.suitsAsCapitalizedStrings[0].length - 1);
    const diamondString = constants_3.suitsAsCapitalizedStrings[1].substr(0, constants_3.suitsAsCapitalizedStrings[1].length - 1);
    const heartString = constants_3.suitsAsCapitalizedStrings[2].substr(0, constants_3.suitsAsCapitalizedStrings[2].length - 1);
    const spadeString = constants_3.suitsAsCapitalizedStrings[3].substr(0, constants_3.suitsAsCapitalizedStrings[3].length - 1);
    if (contract.match(new RegExp(clubString, 'i')))
        return constants_3.suitsHtmlEntities[0];
    if (contract.match(new RegExp(diamondString, 'i')))
        return constants_3.suitsHtmlEntities[1];
    if (contract.match(new RegExp(heartString, 'i')))
        return constants_3.suitsHtmlEntities[2];
    if (contract.match(new RegExp(spadeString, 'i')))
        return constants_3.suitsHtmlEntities[3];
    else
        return 'NT';
}
exports.getHtmlEntityFromContract = getHtmlEntityFromContract;
function getContractAsHtmlEntityString(contract) {
    const split = contract.split(' ');
    const number = +functions_1.getCharValueFromCardValueString(split[0]);
    const htmlEntitySpan = functions_1.getHtmlEntitySpan(split[1], true);
    return `${number}${htmlEntitySpan}`;
}
exports.getContractAsHtmlEntityString = getContractAsHtmlEntityString;
function getPlayingPlayers(seating, declarer) {
    //return the declarer and the declarer's partner as an array of strings
    if (!seating)
        throw new Error('Problem with seating in deal-detail');
    try {
        const declarersDirection = functions_1.getDirectionFromSeating(seating, declarer);
        const declarersPartner = functions_1.getPartnerFromDirection(seating, declarersDirection);
        return [declarer, declarersPartner];
    }
    catch (err) {
        console.log('err =', err);
        return ['', ''];
    }
}
exports.getPlayingPlayers = getPlayingPlayers;
function getAmountMadeAndNeededFromDeal(deal, contractPrefix, seating, declarer) {
    const error = {
        amountNeeded: constants_2.NOT_AVAILABLE_STRING,
        amountMade: store_1.reducerDefaultValue,
    };
    if (!deal.contract || !deal.declarer)
        return error;
    const playingPlayers = getPlayingPlayers(seating, declarer);
    if (!playingPlayers[0])
        return error;
    const amountNeeded = contractPrefix + constants_3.tricksInABook;
    const amountMade = deal === null || deal === void 0 ? void 0 : deal.roundWinners.reduce((count, roundWinner) => {
        if (playingPlayers.includes(roundWinner[0]))
            return count + 1;
        return count;
    }, 0);
    return { amountNeeded, amountMade };
}
exports.getAmountMadeAndNeededFromDeal = getAmountMadeAndNeededFromDeal;
function checkForParentOfType(clickedElement, parentType, classPresent = "") {
    try {
        if (clickedElement &&
            clickedElement.parentNode &&
            clickedElement.parentNode.localName === parentType &&
            clickedElement.parentNode.className.search(classPresent) !== -1)
            return true;
        if (clickedElement.parentNode.localName.search(/html/i) !== -1)
            return false;
        const parent = clickedElement.parentNode;
        return checkForParentOfType(parent, parentType, classPresent);
    }
    catch (error) {
        return false;
    }
}
exports.checkForParentOfType = checkForParentOfType;


/***/ }),

/***/ "./libs/constants/index.ts":
/*!*********************************!*\
  !*** ./libs/constants/index.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
tslib_1.__exportStar(__webpack_require__(/*! ./constants */ "./libs/constants/constants.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./functions */ "./libs/constants/functions.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./playing/constants */ "./libs/constants/playing/constants.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./playing/functions */ "./libs/constants/playing/functions.ts"), exports);


/***/ }),

/***/ "./libs/constants/playing/constants.ts":
/*!*********************************************!*\
  !*** ./libs/constants/playing/constants.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsFull = exports.teams = exports.contracts = exports.cardValuesAsStrings = exports.suitsAsCapitalizedStrings = exports.suitsHtmlEntities = exports.sortOrders = exports.suits = exports.locations = exports.cardinalDirections = exports.tricksInABook = exports.maxCardValue = exports.minCardValue = exports.cardsPerHand = exports.cardsPerSuit = exports.cardsPerDeck = void 0;
exports.cardsPerDeck = 52;
exports.cardsPerSuit = 13;
exports.cardsPerHand = 13;
exports.minCardValue = 0;
exports.maxCardValue = 51;
exports.tricksInABook = 6;
exports.cardinalDirections = ['north', 'east', 'south', 'west'];
exports.locations = ['top', 'right', 'bottom', 'left'];
exports.suits = {
    clubs: 'clubs',
    diamonds: 'diamonds',
    hearts: 'hearts',
    spades: 'spades',
    noTrump: null,
};
exports.sortOrders = {
    Ascending: 'Ascending',
    Descending: 'Descending',
    AscendingAlternatingColors: 'AscendingAlternatingColors',
    DescendingAlternatingColors: 'DescendingAlternatingColors',
};
exports.suitsHtmlEntities = ['&clubs;', '&diams;', '&hearts;', '&spades;'];
exports.suitsAsCapitalizedStrings = [
    'Clubs',
    'Diamonds',
    'Hearts',
    'Spades',
];
exports.cardValuesAsStrings = [
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Jack',
    'Queen',
    'King',
    'Ace',
];
exports.contracts = [
    'One Club',
    'One Diamond',
    'One Heart',
    'One Spade',
    'One No Trump',
    'Two Club',
    'Two Diamond',
    'Two Heart',
    'Two Spade',
    'Two No Trump',
    'Three Club',
    'Three Diamond',
    'Three Heart',
    'Three Spade',
    'Three No Trump',
    'Four Club',
    'Four Diamond',
    'Four Heart',
    'Four Spade',
    'Four No Trump',
    'Five Club',
    'Five Diamond',
    'Five Heart',
    'Five Spade',
    'Five No Trump',
    'Six Club',
    'Six Diamond',
    'Six Heart',
    'Six Spade',
    'Six No Trump',
    'Seven Club',
    'Seven Diamond',
    'Seven Heart',
    'Seven Spade',
    'Seven No Trump',
];
exports.teams = ['NS', 'EW'];
exports.teamsFull = ['northSouth', 'eastWest'];


/***/ }),

/***/ "./libs/constants/playing/functions.ts":
/*!*********************************************!*\
  !*** ./libs/constants/playing/functions.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandArrayFromFlatArray = exports.getUserWhoPlayedCard = exports.flatten = exports.sortHand = exports.getSuitAsStringFromArray = exports.getPartnerFromDirection = exports.getDirectionFromSeating = exports.getIsBidPlayable = exports.getHtmlEntitySpan = exports.getHtmlEntityFromSuitOrCardAsNumber = exports.getCharValueFromCardValueString = exports.getCharacterFromCardAsNumber = exports.getSuitFromNumber = exports.getCardStringFromNumber = void 0;
const constants_1 = __webpack_require__(/*! @nx-bridge/constants */ "./libs/constants/index.ts");
const functions_1 = __webpack_require__(/*! ../functions */ "./libs/constants/functions.ts");
const constants_2 = __webpack_require__(/*! ../constants */ "./libs/constants/constants.ts");
function getCardStringFromNumber(cardAsNumber) {
    if (cardAsNumber === undefined || cardAsNumber === null)
        return '';
    if (cardAsNumber < constants_1.minCardValue || cardAsNumber > constants_1.maxCardValue)
        throw new Error(`Error converting ${cardAsNumber} to card string`);
    const cardValue = constants_1.cardValuesAsStrings[cardAsNumber % constants_1.cardsPerSuit];
    const index = Math.floor(cardAsNumber / constants_1.cardsPerSuit);
    const suit = constants_1.suitsAsCapitalizedStrings[index];
    return cardValue + ' of ' + suit;
}
exports.getCardStringFromNumber = getCardStringFromNumber;
function getSuitFromNumber(cardAsNumber) {
    var _a;
    if (cardAsNumber === null || cardAsNumber === undefined)
        throw new Error(`Error getting suit for cardAsNumber: ${cardAsNumber}.`);
    const index = Math.floor(cardAsNumber / 13);
    if (index === -1)
        return '';
    return (_a = constants_1.suitsAsCapitalizedStrings[index]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
}
exports.getSuitFromNumber = getSuitFromNumber;
function getCharacterFromCardAsNumber(cardAsNumber, getLetterForTen = false) {
    switch (cardAsNumber % 13) {
        case 0:
            return '2';
        case 1:
            return '3';
        case 2:
            return '4';
        case 3:
            return '5';
        case 4:
            return '6';
        case 5:
            return '7';
        case 6:
            return '8';
        case 7:
            return '9';
        case 8:
            if (getLetterForTen)
                return 'T';
            return '10';
        case 9:
            return 'J';
        case 10:
            return 'Q';
        case 11:
            return 'K';
        case 12:
            return 'A';
        default:
            return '';
    }
}
exports.getCharacterFromCardAsNumber = getCharacterFromCardAsNumber;
function getCharValueFromCardValueString(str, getLetterForTen = false) {
    switch (str) {
        case 'Ace':
            return 'A';
        case 'King':
            return 'K';
        case 'Queen':
            return 'Q';
        case 'Jack':
            return 'J';
        case 'Ten':
            if (getLetterForTen)
                return 'T';
            return '10';
        case 'Nine':
            return '9';
        case 'Eight':
            return '8';
        case 'Seven':
            return '7';
        case 'Six':
            return '6';
        case 'Five':
            return '5';
        case 'Four':
            return '4';
        case 'Three':
            return '3';
        case 'Two':
            return '2';
        case 'One':
            return '1';
        default:
            return '';
    }
}
exports.getCharValueFromCardValueString = getCharValueFromCardValueString;
function getHtmlEntityFromSuitOrCardAsNumber(value) {
    if (typeof value === 'number') {
        const suitAsString = getSuitFromNumber(value);
        if (!suitAsString)
            return '';
        const htmlEntityToUse = constants_1.suitsHtmlEntities[constants_1.suitsAsCapitalizedStrings.findIndex((str) => str.toLowerCase() === suitAsString.toLowerCase())];
        return htmlEntityToUse ? htmlEntityToUse : '';
    }
    const index = constants_1.suitsAsCapitalizedStrings.findIndex((s) => {
        return s.slice(0, s.length - 1).toLowerCase() === value.toLowerCase();
    });
    return index !== -1 ? constants_1.suitsHtmlEntities[index] : 'NT';
}
exports.getHtmlEntityFromSuitOrCardAsNumber = getHtmlEntityFromSuitOrCardAsNumber;
function getHtmlEntitySpan(numberOrContract, isContract = false) {
    let colorToUse = 'color-white';
    let htmlEntity = '';
    if (isContract)
        htmlEntity = functions_1.getHtmlEntityFromContract(numberOrContract);
    else
        htmlEntity = constants_1.getHtmlEntityFromCard(numberOrContract);
    if (htmlEntity.match(/diam|heart/i))
        colorToUse = `${constants_1.COLOR_RED_CLASSNAME}-light`;
    return `<span class="${colorToUse}">${htmlEntity}</span>`;
}
exports.getHtmlEntitySpan = getHtmlEntitySpan;
function getIsBidPlayable(bid) {
    if (!bid.match(/double/i) && !bid.match(/pass/i))
        return true;
    return false;
}
exports.getIsBidPlayable = getIsBidPlayable;
function getDirectionFromSeating(seating, username) {
    if (username === constants_2.NOT_AVAILABLE_STRING)
        return constants_2.NOT_AVAILABLE_STRING;
    for (const direction in seating) {
        if (Object.prototype.hasOwnProperty.call(seating, direction)) {
            const usernameInSeating = seating[direction];
            if (username === usernameInSeating)
                return direction;
        }
    }
    throw new Error('Invalid username or seating in getDirectionFromSeating()');
}
exports.getDirectionFromSeating = getDirectionFromSeating;
function getPartnerFromDirection(seating, direction) {
    if (direction === constants_2.NOT_AVAILABLE_STRING)
        return constants_2.NOT_AVAILABLE_STRING;
    if (direction.toLowerCase() === constants_1.cardinalDirections[0].toLowerCase())
        return seating.south;
    else if (direction.toLowerCase() === constants_1.cardinalDirections[1].toLowerCase())
        return seating.west;
    else if (direction.toLowerCase() === constants_1.cardinalDirections[2].toLowerCase())
        return seating.north;
    else if (direction.toLowerCase() === constants_1.cardinalDirections[3].toLowerCase())
        return seating.east;
    throw new Error('Invalid direction or seating in getPartnerFromDirection()');
}
exports.getPartnerFromDirection = getPartnerFromDirection;
function getSuitAsStringFromArray(suit) {
    if (suit && suit.length > 0) {
        const cardsAsChar = [];
        for (let i = 0; i < suit.length; i++) {
            const cardAsNumber = suit[i];
            cardsAsChar.push(getCharacterFromCardAsNumber(cardAsNumber % constants_1.cardsPerSuit, true));
        }
        return cardsAsChar.join(',');
    }
    return null;
}
exports.getSuitAsStringFromArray = getSuitAsStringFromArray;
function sortHand(hand) {
    //Sorts the hand clubs, diams, hearts, then spades (for displaying in replays)
    let clubs = [], diamonds = [], hearts = [], spades = [];
    for (let i = 0; i < hand.length; i++) {
        const suit = hand[i];
        const suitAsString = getSuitFromNumber(suit && suit.length > 0 ? suit[0] : -1);
        if (suitAsString === constants_1.suits.clubs)
            clubs = suit;
        else if (suitAsString === constants_1.suits.diamonds)
            diamonds = suit;
        else if (suitAsString === constants_1.suits.hearts)
            hearts = suit;
        else if (suitAsString === constants_1.suits.spades)
            spades = suit;
    }
    return [clubs, diamonds, hearts, spades];
}
exports.sortHand = sortHand;
function flatten(array, depth = 1) {
    return depth > 0
        ? array.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
        : array.slice();
}
exports.flatten = flatten;
function getUserWhoPlayedCard(hands, card) {
    for (const username in hands) {
        if (Object.prototype.hasOwnProperty.call(hands, username)) {
            const hand = hands[username];
            const flatHand = flatten(hand);
            if (flatHand === null || flatHand === void 0 ? void 0 : flatHand.includes(card)) {
                return username;
            }
        }
    }
    return '';
}
exports.getUserWhoPlayedCard = getUserWhoPlayedCard;
function createHandArrayFromFlatArray(flatArray) {
    const spades = [], hearts = [], diamonds = [], clubs = [];
    for (let i = 0; i < flatArray.length; i++) {
        const cardAsNumber = flatArray[i];
        if (cardAsNumber >= 0 && cardAsNumber <= 12)
            clubs.push(cardAsNumber);
        else if (cardAsNumber >= 13 && cardAsNumber <= 25)
            diamonds.push(cardAsNumber);
        else if (cardAsNumber >= 26 && cardAsNumber <= 38)
            hearts.push(cardAsNumber);
        else if (cardAsNumber >= 39 && cardAsNumber <= 51)
            spades.push(cardAsNumber);
    }
    return [spades, hearts, clubs, diamonds];
}
exports.createHandArrayFromFlatArray = createHandArrayFromFlatArray;


/***/ }),

/***/ "./libs/interfaces-and-types/src/index.ts":
/*!************************************************!*\
  !*** ./libs/interfaces-and-types/src/index.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
tslib_1.__exportStar(__webpack_require__(/*! ./lib/frontend-types */ "./libs/interfaces-and-types/src/lib/frontend-types.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/controller-types */ "./libs/interfaces-and-types/src/lib/controller-types.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/both-types */ "./libs/interfaces-and-types/src/lib/both-types.ts"), exports);


/***/ }),

/***/ "./libs/interfaces-and-types/src/lib/both-types.ts":
/*!*********************************************************!*\
  !*** ./libs/interfaces-and-types/src/lib/both-types.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
;


/***/ }),

/***/ "./libs/interfaces-and-types/src/lib/controller-types.ts":
/*!***************************************************************!*\
  !*** ./libs/interfaces-and-types/src/lib/controller-types.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/interfaces-and-types/src/lib/frontend-types.ts":
/*!*************************************************************!*\
  !*** ./libs/interfaces-and-types/src/lib/frontend-types.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleDealDetailButtonBehavior = exports.SortOptions = exports.ReducerNames = exports.GameDetailSizes = exports.DateType = void 0;
//#endregion
//#region Enums
var DateType;
(function (DateType) {
    DateType[DateType["before"] = 0] = "before";
    DateType[DateType["after"] = 1] = "after";
})(DateType = exports.DateType || (exports.DateType = {}));
var GameDetailSizes;
(function (GameDetailSizes) {
    GameDetailSizes["small"] = "small";
    GameDetailSizes["medium"] = "medium";
    GameDetailSizes["large"] = "large";
})(GameDetailSizes = exports.GameDetailSizes || (exports.GameDetailSizes = {}));
var ReducerNames;
(function (ReducerNames) {
    ReducerNames["deals"] = "deals";
    ReducerNames["games"] = "games";
    ReducerNames["users"] = "users";
    ReducerNames["filters"] = "filters";
    ReducerNames["general"] = "general";
})(ReducerNames = exports.ReducerNames || (exports.ReducerNames = {}));
var SortOptions;
(function (SortOptions) {
    SortOptions["ascending"] = "ascending";
    SortOptions["descending"] = "descending";
})(SortOptions = exports.SortOptions || (exports.SortOptions = {}));
var ToggleDealDetailButtonBehavior;
(function (ToggleDealDetailButtonBehavior) {
    ToggleDealDetailButtonBehavior[ToggleDealDetailButtonBehavior["toggle"] = 0] = "toggle";
    ToggleDealDetailButtonBehavior[ToggleDealDetailButtonBehavior["open"] = 1] = "open";
    ToggleDealDetailButtonBehavior[ToggleDealDetailButtonBehavior["close"] = 2] = "close";
})(ToggleDealDetailButtonBehavior = exports.ToggleDealDetailButtonBehavior || (exports.ToggleDealDetailButtonBehavior = {}));
//#endregion


/***/ }),

/***/ "./libs/store/src/index.ts":
/*!*********************************!*\
  !*** ./libs/store/src/index.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
tslib_1.__exportStar(__webpack_require__(/*! ./lib/actions/deal.actions */ "./libs/store/src/lib/actions/deal.actions.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/actions/game.actions */ "./libs/store/src/lib/actions/game.actions.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/actions/user.actions */ "./libs/store/src/lib/actions/user.actions.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/actions/filter.actions */ "./libs/store/src/lib/actions/filter.actions.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/actions/general.actions */ "./libs/store/src/lib/actions/general.actions.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/reducers/app.reducer */ "./libs/store/src/lib/reducers/app.reducer.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/reducers/user.reducer */ "./libs/store/src/lib/reducers/user.reducer.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/reducers/deal.reducer */ "./libs/store/src/lib/reducers/deal.reducer.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/reducers/game.reducer */ "./libs/store/src/lib/reducers/game.reducer.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/reducers/filter.reducer */ "./libs/store/src/lib/reducers/filter.reducer.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lib/reducers/general.reducer */ "./libs/store/src/lib/reducers/general.reducer.ts"), exports);


/***/ }),

/***/ "./libs/store/src/lib/actions/deal.actions.ts":
/*!****************************************************!*\
  !*** ./libs/store/src/lib/actions/deal.actions.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetCurrentlyViewingDealContract = exports.SetCurrentlyViewingDeal = exports.AddFetchedDeals = exports.SetFetchedDeals = exports.SetDealsAsStrings = exports.SET_CURRENTLY_VIEWING_DEAL_CONTRACT = exports.SET_CURRENTLY_VIEWING_DEAL = exports.ADD_FETCHED_DEALS = exports.SET_FETCHED_DEALS = exports.SET_DEALS_AS_STRING = void 0;
exports.SET_DEALS_AS_STRING = '[Deals] SET_DEALS_AS_STRINGS';
exports.SET_FETCHED_DEALS = '[Deals] SET_FETCHED_DEALS';
exports.ADD_FETCHED_DEALS = '[Deals] ADD_FETCHED_DEALS';
exports.SET_CURRENTLY_VIEWING_DEAL = '[Deals] SET_CURRENTLY_VIEWING_DEAL';
exports.SET_CURRENTLY_VIEWING_DEAL_CONTRACT = '[Deals] SET_CURRENTLY_VIEWING_DEAL_CONTRACT';
class SetDealsAsStrings {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_DEALS_AS_STRING;
    }
}
exports.SetDealsAsStrings = SetDealsAsStrings;
class SetFetchedDeals {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_FETCHED_DEALS;
    }
}
exports.SetFetchedDeals = SetFetchedDeals;
class AddFetchedDeals {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ADD_FETCHED_DEALS;
    }
}
exports.AddFetchedDeals = AddFetchedDeals;
class SetCurrentlyViewingDeal {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_CURRENTLY_VIEWING_DEAL;
    }
}
exports.SetCurrentlyViewingDeal = SetCurrentlyViewingDeal;
class SetCurrentlyViewingDealContract {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_CURRENTLY_VIEWING_DEAL_CONTRACT;
    }
}
exports.SetCurrentlyViewingDealContract = SetCurrentlyViewingDealContract;


/***/ }),

/***/ "./libs/store/src/lib/actions/filter.actions.ts":
/*!******************************************************!*\
  !*** ./libs/store/src/lib/actions/filter.actions.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetWonByFilter = exports.SetPlayerInGameFilter = exports.SetPlayerHasCard = exports.SetOpeningBidFilter = exports.SetIsFilterSame = exports.SetGameNameFilter = exports.SetDoubleFilter = exports.SetDeclarerFilter = exports.SetDealsThatMatchFilters = exports.SetDealResultFilter = exports.SetContractFilter = exports.SetBeforeDate = exports.SetAfterDate = exports.RemovePlayerInGameFilter = exports.RemovePlayerHasCard = exports.AddPlayerInGameFilter = exports.AddPlayerHasCard = exports.SET_WON_BY_FILTER = exports.SET_PLAYER_HAS_CARD = exports.SET_PLAYER_IN_GAME_FILTER = exports.SET_OPENING_BID_FILTER = exports.SET_IS_FILTER_SAME = exports.SET_GAME_NAME_FILTER = exports.SET_DOUBLE_FILTER = exports.SET_DECLARER_FILTER = exports.SET_DEALS_THAT_MATCH_FILTERS = exports.SET_DEAL_RESULT_FILTER = exports.SET_CONTRACT_FILTER = exports.SET_BEFORE_DATE = exports.SET_AFTER_DATE = exports.REMOVE_PLAYER_IN_GAME_FILTER = exports.REMOVE_PLAYER_HAS_CARD = exports.ADD_PLAYER_IN_GAME_FILTER = exports.ADD_PLAYER_HAS_CARD = void 0;
exports.ADD_PLAYER_HAS_CARD = '[Filter] ADD_PLAYER_HAS_CARD';
exports.ADD_PLAYER_IN_GAME_FILTER = '[Filter] ADD_PLAYER_IN_GAME_FILTER';
exports.REMOVE_PLAYER_HAS_CARD = '[Filter] REMOVE_PLAYER_HAS_CARD';
exports.REMOVE_PLAYER_IN_GAME_FILTER = '[Filter] REMOVE_PLAYER_IN_GAME_FILTER';
exports.SET_AFTER_DATE = '[Filter] SET_AFTER_DATE';
exports.SET_BEFORE_DATE = '[Filter] SET_BEFORE_DATE';
exports.SET_CONTRACT_FILTER = '[Filter] SET_CONTRACT_FILTER';
exports.SET_DEAL_RESULT_FILTER = '[Filter] SET_DEAL_RESULT_FILTER';
exports.SET_DEALS_THAT_MATCH_FILTERS = '[Filter] SET_DEALS_THAT_MATCH_FILTERS';
exports.SET_DECLARER_FILTER = '[Filter] SET_DECLARER_FILTER';
exports.SET_DOUBLE_FILTER = '[Filter] SET_DOUBLE_FILTER';
exports.SET_GAME_NAME_FILTER = '[Filter] SET_GAME_NAME_FILTER';
exports.SET_IS_FILTER_SAME = '[Filter] SET_IS_FILTER_SAME';
exports.SET_OPENING_BID_FILTER = '[Filter] SET_OPENING_BID_FILTER';
exports.SET_PLAYER_IN_GAME_FILTER = '[Filter] SET_PLAYER_IN_GAME_FILTER';
exports.SET_PLAYER_HAS_CARD = '[Filter] SET_PLAYER_HAS_CARD';
exports.SET_WON_BY_FILTER = '[Filter] SET_WON_BY_FILTER';
class AddPlayerHasCard {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ADD_PLAYER_HAS_CARD;
    }
}
exports.AddPlayerHasCard = AddPlayerHasCard;
class AddPlayerInGameFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ADD_PLAYER_IN_GAME_FILTER;
    }
}
exports.AddPlayerInGameFilter = AddPlayerInGameFilter;
class RemovePlayerHasCard {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.REMOVE_PLAYER_HAS_CARD;
    }
}
exports.RemovePlayerHasCard = RemovePlayerHasCard;
class RemovePlayerInGameFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.REMOVE_PLAYER_IN_GAME_FILTER;
    }
}
exports.RemovePlayerInGameFilter = RemovePlayerInGameFilter;
class SetAfterDate {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_AFTER_DATE;
    }
}
exports.SetAfterDate = SetAfterDate;
class SetBeforeDate {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_BEFORE_DATE;
    }
}
exports.SetBeforeDate = SetBeforeDate;
class SetContractFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_CONTRACT_FILTER;
    }
}
exports.SetContractFilter = SetContractFilter;
class SetDealResultFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_DEAL_RESULT_FILTER;
    }
}
exports.SetDealResultFilter = SetDealResultFilter;
class SetDealsThatMatchFilters {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_DEALS_THAT_MATCH_FILTERS;
    }
}
exports.SetDealsThatMatchFilters = SetDealsThatMatchFilters;
class SetDeclarerFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_DECLARER_FILTER;
    }
}
exports.SetDeclarerFilter = SetDeclarerFilter;
class SetDoubleFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_DOUBLE_FILTER;
    }
}
exports.SetDoubleFilter = SetDoubleFilter;
class SetGameNameFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_GAME_NAME_FILTER;
    }
}
exports.SetGameNameFilter = SetGameNameFilter;
class SetIsFilterSame {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_IS_FILTER_SAME;
    }
}
exports.SetIsFilterSame = SetIsFilterSame;
class SetOpeningBidFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_OPENING_BID_FILTER;
    }
}
exports.SetOpeningBidFilter = SetOpeningBidFilter;
class SetPlayerHasCard {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_PLAYER_HAS_CARD;
    }
}
exports.SetPlayerHasCard = SetPlayerHasCard;
class SetPlayerInGameFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_PLAYER_IN_GAME_FILTER;
    }
}
exports.SetPlayerInGameFilter = SetPlayerInGameFilter;
class SetWonByFilter {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_WON_BY_FILTER;
    }
}
exports.SetWonByFilter = SetWonByFilter;


/***/ }),

/***/ "./libs/store/src/lib/actions/game.actions.ts":
/*!****************************************************!*\
  !*** ./libs/store/src/lib/actions/game.actions.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetIsViewingGame = exports.SetFilteredGames = exports.SetCurrentlyDisplayingGames = exports.SetGames = exports.SetCurrentlyViewingGame = exports.SET_IS_VIEWING_GAME = exports.SET_CURRENTLY_DISPLAYING_GAMES = exports.SET_FILTERED_GAMES = exports.SET_CURRENTLY_VIEWING_GAME = exports.SET_GAMES = void 0;
exports.SET_GAMES = '[Games] SET_GAMES';
exports.SET_CURRENTLY_VIEWING_GAME = '[Games] SET_CURRENTLY_VIEWING_GAME';
exports.SET_FILTERED_GAMES = '[Games] SET_FILTERED_GAMES';
exports.SET_CURRENTLY_DISPLAYING_GAMES = '[Games] SET_CURRENTLY_DISPLAYING_GAMES';
exports.SET_IS_VIEWING_GAME = '[Games] SET_IS_VIEWING_GAME';
exports.SET_FILTERED_GAMES;
class SetCurrentlyViewingGame {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_CURRENTLY_VIEWING_GAME;
    }
}
exports.SetCurrentlyViewingGame = SetCurrentlyViewingGame;
class SetGames {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_GAMES;
    }
}
exports.SetGames = SetGames;
class SetCurrentlyDisplayingGames {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_CURRENTLY_DISPLAYING_GAMES;
    }
}
exports.SetCurrentlyDisplayingGames = SetCurrentlyDisplayingGames;
class SetFilteredGames {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_FILTERED_GAMES;
    }
}
exports.SetFilteredGames = SetFilteredGames;
class SetIsViewingGame {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_IS_VIEWING_GAME;
    }
}
exports.SetIsViewingGame = SetIsViewingGame;


/***/ }),

/***/ "./libs/store/src/lib/actions/general.actions.ts":
/*!*******************************************************!*\
  !*** ./libs/store/src/lib/actions/general.actions.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSortingPreference = exports.SetResultsPerPagePreference = exports.SetLoadingError = exports.SetIsLoading = exports.SetBatchNumber = exports.SET_RESULTS_PER_PAGE_PREFERENCE = exports.SET_SORTING_PREFERENCE = exports.SET_LOADING_ERROR = exports.SET_IS_LOADING = exports.SET_BATCH_NUMBER = void 0;
exports.SET_BATCH_NUMBER = '[General] SET_BATCH_NUMBER';
exports.SET_IS_LOADING = '[General] SET_IS_LOADING';
exports.SET_LOADING_ERROR = '[General] SET_LOADING_ERROR';
exports.SET_SORTING_PREFERENCE = '[General] SET_SORTING_PREFERENCE';
exports.SET_RESULTS_PER_PAGE_PREFERENCE = '[General] SET_RESULTS_PER_PAGE_PREFERENCE';
class SetBatchNumber {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_BATCH_NUMBER;
    }
}
exports.SetBatchNumber = SetBatchNumber;
class SetIsLoading {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_IS_LOADING;
    }
}
exports.SetIsLoading = SetIsLoading;
class SetLoadingError {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_LOADING_ERROR;
    }
}
exports.SetLoadingError = SetLoadingError;
class SetResultsPerPagePreference {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_RESULTS_PER_PAGE_PREFERENCE;
    }
}
exports.SetResultsPerPagePreference = SetResultsPerPagePreference;
class SetSortingPreference {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_SORTING_PREFERENCE;
    }
}
exports.SetSortingPreference = SetSortingPreference;


/***/ }),

/***/ "./libs/store/src/lib/actions/user.actions.ts":
/*!****************************************************!*\
  !*** ./libs/store/src/lib/actions/user.actions.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetCurrentlyViewingUser = exports.SetUserIds = exports.SET_CURRENTLY_VIEWING_USER = exports.SET_USERS = void 0;
exports.SET_USERS = '[Users] SET_USERS';
exports.SET_CURRENTLY_VIEWING_USER = '[Users] SET_CURRENTLY_VIEWING_USER';
class SetUserIds {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_USERS;
    }
}
exports.SetUserIds = SetUserIds;
class SetCurrentlyViewingUser {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.SET_CURRENTLY_VIEWING_USER;
    }
}
exports.SetCurrentlyViewingUser = SetCurrentlyViewingUser;


/***/ }),

/***/ "./libs/store/src/lib/reducers/app.reducer.ts":
/*!****************************************************!*\
  !*** ./libs/store/src/lib/reducers/app.reducer.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.appReducer = void 0;
const fromDeal = __webpack_require__(/*! ./deal.reducer */ "./libs/store/src/lib/reducers/deal.reducer.ts");
const fromGame = __webpack_require__(/*! ./game.reducer */ "./libs/store/src/lib/reducers/game.reducer.ts");
const fromUser = __webpack_require__(/*! ./user.reducer */ "./libs/store/src/lib/reducers/user.reducer.ts");
const fromFilter = __webpack_require__(/*! ./filter.reducer */ "./libs/store/src/lib/reducers/filter.reducer.ts");
const fromGeneral = __webpack_require__(/*! ./general.reducer */ "./libs/store/src/lib/reducers/general.reducer.ts");
const interfaces_and_types_1 = __webpack_require__(/*! @nx-bridge/interfaces-and-types */ "./libs/interfaces-and-types/src/index.ts");
exports.appReducer = {
    [interfaces_and_types_1.ReducerNames.deals]: fromDeal.dealReducer,
    [interfaces_and_types_1.ReducerNames.games]: fromGame.gameReducer,
    [interfaces_and_types_1.ReducerNames.users]: fromUser.userReducer,
    [interfaces_and_types_1.ReducerNames.filters]: fromFilter.filterReducer,
    [interfaces_and_types_1.ReducerNames.general]: fromGeneral.generalReducer,
};


/***/ }),

/***/ "./libs/store/src/lib/reducers/deal.reducer.ts":
/*!*****************************************************!*\
  !*** ./libs/store/src/lib/reducers/deal.reducer.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.dealReducer = void 0;
const fromDealActions = __webpack_require__(/*! ../actions/deal.actions */ "./libs/store/src/lib/actions/deal.actions.ts");
const INITIAL_STATE = {
    dealsAsStrings: [],
    fetchedDeals: {},
    currentlyViewingDeal: {},
    currentlyViewingDealContract: { prefix: '', htmlEntity: '', doubleMultiplier: 1 },
};
function dealReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case fromDealActions.SET_DEALS_AS_STRING:
            return Object.assign(Object.assign({}, state), { dealsAsStrings: action.payload });
        case fromDealActions.SET_FETCHED_DEALS:
            return Object.assign(Object.assign({}, state), { fetchedDeals: action.payload });
        case fromDealActions.ADD_FETCHED_DEALS:
            return Object.assign(Object.assign({}, state), { fetchedDeals: Object.assign(Object.assign({}, state.fetchedDeals), action.payload) });
        case fromDealActions.SET_CURRENTLY_VIEWING_DEAL:
            return Object.assign(Object.assign({}, state), { currentlyViewingDeal: action.payload });
        case fromDealActions.SET_CURRENTLY_VIEWING_DEAL_CONTRACT:
            return Object.assign(Object.assign({}, state), { currentlyViewingDealContract: action.payload });
        default:
            return state;
    }
}
exports.dealReducer = dealReducer;
// 


/***/ }),

/***/ "./libs/store/src/lib/reducers/filter.reducer.ts":
/*!*******************************************************!*\
  !*** ./libs/store/src/lib/reducers/filter.reducer.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.filterReducer = exports.reducerDefaultValue = void 0;
const fromFilterActions = __webpack_require__(/*! ../actions/filter.actions */ "./libs/store/src/lib/actions/filter.actions.ts");
exports.reducerDefaultValue = -1;
const INITIAL_STATE = {
    afterDate: 0,
    beforeDate: 0,
    contract: `${exports.reducerDefaultValue}`,
    dealResult: { amount: exports.reducerDefaultValue, type: `${exports.reducerDefaultValue}` },
    dealsThatMatchFilters: [`${exports.reducerDefaultValue}`],
    declarer: `${exports.reducerDefaultValue}`,
    double: exports.reducerDefaultValue,
    gameName: `${exports.reducerDefaultValue}`,
    isFilterSame: false,
    openingBid: `${exports.reducerDefaultValue}`,
    playerHasCard: { initial: [] },
    playerInGame: [`${exports.reducerDefaultValue}`],
    wonBy: { amount: exports.reducerDefaultValue, type: `${exports.reducerDefaultValue}` },
};
function filterReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case fromFilterActions.ADD_PLAYER_IN_GAME_FILTER:
            const toAdd = [...state.playerInGame];
            const indexToAdd = toAdd.findIndex((current) => current === `${exports.reducerDefaultValue}`);
            if (indexToAdd !== -1)
                toAdd.splice(indexToAdd, 1);
            return Object.assign(Object.assign({}, state), { playerInGame: [...toAdd, action.payload] });
        case fromFilterActions.ADD_PLAYER_HAS_CARD:
            const newPlayerHasCard = Object.assign({}, action.payload);
            const usernameKey = Object.keys(newPlayerHasCard)[0];
            const usernameValues = state.playerHasCard[usernameKey];
            if (usernameValues) {
                const usernameValuesCopy = [...usernameValues];
                const valueToAdd = newPlayerHasCard[usernameKey];
                usernameValuesCopy.push(...valueToAdd);
                newPlayerHasCard[usernameKey] = [...usernameValuesCopy];
            }
            return Object.assign(Object.assign({}, state), { playerHasCard: Object.assign(Object.assign({}, state.playerHasCard), newPlayerHasCard) });
        case fromFilterActions.REMOVE_PLAYER_HAS_CARD:
            const { username, card } = action.payload;
            const values = state.playerHasCard[username];
            const index = values.findIndex((c) => c === card);
            const newPlayerHasCardFilter = { [username]: [...values] };
            newPlayerHasCardFilter[username].splice(index, 1);
            if (newPlayerHasCardFilter[username].length === 0) {
                const newState = Object.assign({}, state.playerHasCard);
                delete newState[username];
                return Object.assign(Object.assign({}, state), { playerHasCard: newState });
            }
            return Object.assign(Object.assign({}, state), { playerHasCard: Object.assign(Object.assign({}, state.playerHasCard), newPlayerHasCardFilter) });
        case fromFilterActions.REMOVE_PLAYER_IN_GAME_FILTER:
            const newPlayerInGame = [...state.playerInGame];
            const indexOfPlayerInGame = newPlayerInGame.findIndex((current) => action.payload === current);
            if (indexOfPlayerInGame !== -1)
                newPlayerInGame.splice(indexOfPlayerInGame, 1);
            return Object.assign(Object.assign({}, state), { playerInGame: newPlayerInGame });
        case fromFilterActions.SET_AFTER_DATE:
            return Object.assign(Object.assign({}, state), { afterDate: action.payload });
        case fromFilterActions.SET_BEFORE_DATE:
            return Object.assign(Object.assign({}, state), { beforeDate: action.payload });
        case fromFilterActions.SET_CONTRACT_FILTER:
            return Object.assign(Object.assign({}, state), { contract: action.payload });
        case fromFilterActions.SET_DEAL_RESULT_FILTER:
            const newDealResult = action.payload;
            return Object.assign(Object.assign({}, state), { dealResult: isNaN(newDealResult.amount)
                    ? { amount: exports.reducerDefaultValue, type: `${exports.reducerDefaultValue}` }
                    : newDealResult });
        case fromFilterActions.SET_DEALS_THAT_MATCH_FILTERS:
            return Object.assign(Object.assign({}, state), { dealsThatMatchFilters: action.payload });
        case fromFilterActions.SET_DECLARER_FILTER:
            return Object.assign(Object.assign({}, state), { declarer: action.payload });
        case fromFilterActions.SET_DOUBLE_FILTER:
            return Object.assign(Object.assign({}, state), { double: action.payload });
        case fromFilterActions.SET_GAME_NAME_FILTER:
            return Object.assign(Object.assign({}, state), { gameName: action.payload });
        case fromFilterActions.SET_IS_FILTER_SAME:
            return Object.assign(Object.assign({}, state), { isFilterSame: action.payload });
        case fromFilterActions.SET_OPENING_BID_FILTER:
            return Object.assign(Object.assign({}, state), { openingBid: action.payload });
        case fromFilterActions.SET_PLAYER_HAS_CARD:
            return Object.assign(Object.assign({}, state), { playerHasCard: action.payload });
        case fromFilterActions.SET_PLAYER_IN_GAME_FILTER:
            return Object.assign(Object.assign({}, state), { playerInGame: action.payload });
        case fromFilterActions.SET_WON_BY_FILTER:
            const newWonBy = action.payload;
            return Object.assign(Object.assign({}, state), { wonBy: isNaN(newWonBy.amount)
                    ? { amount: exports.reducerDefaultValue, type: `${exports.reducerDefaultValue}` }
                    : newWonBy });
        default:
            return state;
    }
}
exports.filterReducer = filterReducer;
//


/***/ }),

/***/ "./libs/store/src/lib/reducers/game.reducer.ts":
/*!*****************************************************!*\
  !*** ./libs/store/src/lib/reducers/game.reducer.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.gameReducer = void 0;
const fromGameActions = __webpack_require__(/*! ../actions/game.actions */ "./libs/store/src/lib/actions/game.actions.ts");
const INITIAL_STATE = {
    games: [],
    currentlyDisplayingGames: [],
    filteredGames: [],
    currentlyViewingGame: {},
    isViewingGame: false,
};
function gameReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case fromGameActions.SET_GAMES:
            return Object.assign(Object.assign({}, state), { games: action.payload });
        case fromGameActions.SET_CURRENTLY_VIEWING_GAME:
            return Object.assign(Object.assign({}, state), { currentlyViewingGame: action.payload });
        case fromGameActions.SET_CURRENTLY_DISPLAYING_GAMES:
            return Object.assign(Object.assign({}, state), { currentlyDisplayingGames: action.payload });
        case fromGameActions.SET_FILTERED_GAMES:
            return Object.assign(Object.assign({}, state), { filteredGames: action.payload });
        case fromGameActions.SET_IS_VIEWING_GAME:
            return Object.assign(Object.assign({}, state), { isViewingGame: action.payload });
        default:
            return state;
    }
}
exports.gameReducer = gameReducer;


/***/ }),

/***/ "./libs/store/src/lib/reducers/general.reducer.ts":
/*!********************************************************!*\
  !*** ./libs/store/src/lib/reducers/general.reducer.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.generalReducer = void 0;
const fromGeneralActions = __webpack_require__(/*! ../actions/general.actions */ "./libs/store/src/lib/actions/general.actions.ts");
const INITIAL_STATE = {
    batchNumber: 0,
    isLoading: false,
    loadingError: '',
    resultsPerPagePreference: '',
    sortingPreference: '',
};
function generalReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case fromGeneralActions.SET_BATCH_NUMBER:
            if (isNaN(action.payload))
                return state;
            return Object.assign(Object.assign({}, state), { batchNumber: action.payload });
        case fromGeneralActions.SET_IS_LOADING:
            return Object.assign(Object.assign({}, state), { isLoading: action.payload });
        case fromGeneralActions.SET_LOADING_ERROR:
            return Object.assign(Object.assign({}, state), { loadingError: action.payload });
        case fromGeneralActions.SET_RESULTS_PER_PAGE_PREFERENCE:
            return Object.assign(Object.assign({}, state), { resultsPerPagePreference: action.payload });
        case fromGeneralActions.SET_SORTING_PREFERENCE:
            return Object.assign(Object.assign({}, state), { sortingPreference: action.payload });
        default:
            return state;
    }
}
exports.generalReducer = generalReducer;


/***/ }),

/***/ "./libs/store/src/lib/reducers/user.reducer.ts":
/*!*****************************************************!*\
  !*** ./libs/store/src/lib/reducers/user.reducer.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.userReducer = void 0;
const UserActions = __webpack_require__(/*! ../actions/user.actions */ "./libs/store/src/lib/actions/user.actions.ts");
const INITIAL_STATE = {
    userIds: {},
    currentlyViewingUser: {},
};
const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UserActions.SET_USERS:
            return Object.assign(Object.assign({}, state), { userIds: action.payload });
        case UserActions.SET_CURRENTLY_VIEWING_USER:
            return Object.assign(Object.assign({}, state), { currentlyViewingUser: action.payload });
        default:
            return state;
    }
};
exports.userReducer = userReducer;


/***/ }),

/***/ 0:
/*!************************************!*\
  !*** multi ./apps/api/src/main.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /media/adam/Projects/nx-bridge/apps/api/src/main.ts */"./apps/api/src/main.ts");


/***/ }),

/***/ "@angular/core":
/*!********************************!*\
  !*** external "@angular/core" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@angular/core");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/serve-static":
/*!***************************************!*\
  !*** external "@nestjs/serve-static" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/serve-static");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "tslib":
/*!************************!*\
  !*** external "tslib" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tslib");

/***/ })

/******/ })));
//# sourceMappingURL=main.js.map