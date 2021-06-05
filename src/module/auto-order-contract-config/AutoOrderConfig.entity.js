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
let AutoOrderContractConfigEntity = class AutoOrderContractConfigEntity extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], AutoOrderContractConfigEntity.prototype, "symbol", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "buy_open", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "sell_close", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "sell_open", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "buy_close", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "lever_rate", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], AutoOrderContractConfigEntity.prototype, "period", void 0);
__decorate([
    typeorm_1.Column({ type: 'float' }),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "oversoldRatio", void 0);
__decorate([
    typeorm_1.Column({ type: 'float' }),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "overboughtRatio", void 0);
__decorate([
    typeorm_1.Column({ type: 'float' }),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "sellAmountRatio", void 0);
__decorate([
    typeorm_1.Column({ type: 'float' }),
    __metadata("design:type", Number)
], AutoOrderContractConfigEntity.prototype, "buyAmountRatio", void 0);
__decorate([
    typeorm_1.Column({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], AutoOrderContractConfigEntity.prototype, "contract", void 0);
AutoOrderContractConfigEntity = __decorate([
    typeorm_1.Entity()
], AutoOrderContractConfigEntity);
exports.default = AutoOrderContractConfigEntity;
