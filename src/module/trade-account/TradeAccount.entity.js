"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
let TradeAccountEntity = /** @class */ (() => {
    let TradeAccountEntity = class TradeAccountEntity extends typeorm_1.BaseEntity {
        constructor() {
            super(...arguments);
            this.auto_trade = 0;
        }
    };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], TradeAccountEntity.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: 'tinyint' }),
        __metadata("design:type", Object)
    ], TradeAccountEntity.prototype, "auto_trade", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 10 }),
        __metadata("design:type", String)
    ], TradeAccountEntity.prototype, "exchange", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 64 }),
        __metadata("design:type", String)
    ], TradeAccountEntity.prototype, "access_key", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 64 }),
        __metadata("design:type", String)
    ], TradeAccountEntity.prototype, "secret_key", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 32 }),
        __metadata("design:type", String)
    ], TradeAccountEntity.prototype, "uid", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 10 }),
        __metadata("design:type", String)
    ], TradeAccountEntity.prototype, "account_id_pro", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 14 }),
        __metadata("design:type", String)
    ], TradeAccountEntity.prototype, "trade_password", void 0);
    TradeAccountEntity = __decorate([
        typeorm_1.Entity()
    ], TradeAccountEntity);
    return TradeAccountEntity;
})();
exports.default = TradeAccountEntity;
