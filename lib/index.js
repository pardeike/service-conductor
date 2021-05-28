"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conductor_1 = __importDefault(require("./conductor"));
const transformer_1 = require("./transformer");
conductor_1.default.main();
exports.default = {
    run: transformer_1.run,
    transformer: transformer_1.transformer
};
//# sourceMappingURL=index.js.map