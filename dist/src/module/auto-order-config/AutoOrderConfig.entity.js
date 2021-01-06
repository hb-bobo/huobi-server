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
let AutoOrderConfigEntity = /** @class */ (() => {
    let AutoOrderConfigEntity = class AutoOrderConfigEntity extends typeorm_1.BaseEntity {
    };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], AutoOrderConfigEntity.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 10 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "user", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 10 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "symbol", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 18 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "sellAmountThreshold", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 18 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "buyAmountThreshold", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 18 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "buyStrengths", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 10 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "sellStrengths", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 14 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "buyGain", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 14 }),
        __metadata("design:type", String)
    ], AutoOrderConfigEntity.prototype, "sellGain", void 0);
    __decorate([
        typeorm_1.Column({ type: 'tinyint' }),
        __metadata("design:type", Number)
    ], AutoOrderConfigEntity.prototype, "isUp", void 0);
    __decorate([
        typeorm_1.Column({ type: 'tinyint' }),
        __metadata("design:type", Number)
    ], AutoOrderConfigEntity.prototype, "isFall", void 0);
    AutoOrderConfigEntity = __decorate([
        typeorm_1.Entity()
    ], AutoOrderConfigEntity);
    return AutoOrderConfigEntity;
})();
exports.default = AutoOrderConfigEntity;
