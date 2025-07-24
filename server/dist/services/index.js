"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initServices;
const game_service_1 = __importDefault(require("./game.service"));
const user_services_1 = __importDefault(require("./user.services"));
const transaction_service_1 = __importDefault(require("./transaction.service"));
function initServices(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return {
                user: new user_services_1.default(context),
                game: new game_service_1.default(context),
                transaction: new transaction_service_1.default(context)
            };
        }
        catch (e) {
            throw e;
        }
    });
}
