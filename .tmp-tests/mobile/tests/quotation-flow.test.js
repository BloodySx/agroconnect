"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const quotation_flow_1 = require("../src/features/new-quotation/quotation-flow");
const ss260Product = {
    id: 'd1764d6c-3fc0-47fd-b137-885fc531ac0f',
    name: 'SS-260',
};
const ss260ApiResponse = [
    {
        id: 'ffa4dc68-12f4-4bc2-82f0-58fff780c7f0',
        productId: ss260Product.id,
        packageId: '0dc47c18-fe96-474e-95e3-74b4f29ce124',
        price: 12.5,
        unit: 'litro',
        active: true,
        createdAt: '2026-09-06T16:51:01.771Z',
        updatedAt: '2026-09-06T16:51:01.771Z',
        packageVolumeLiters: 1000,
        package: {
            id: '0dc47c18-fe96-474e-95e3-74b4f29ce124',
            name: 'IBC 1000L',
            type: 'IBC_1000L',
            capacity: '1000L',
            capacityLiters: 1000,
            active: true,
            createdAt: '2026-09-06T16:51:00.202Z',
            updatedAt: '2026-09-06T16:51:00.202Z',
        },
    },
    {
        id: '0d1627de-1ce8-4dae-8b32-0ac7e56a7eb1',
        productId: ss260Product.id,
        packageId: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
        price: 13,
        unit: 'litro',
        active: true,
        createdAt: '2026-09-06T16:51:01.566Z',
        updatedAt: '2026-09-06T16:51:01.566Z',
        packageVolumeLiters: 15,
        package: {
            id: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
            name: 'Sachê',
            type: 'SACHÊ',
            capacity: 'Pequena',
            capacityLiters: null,
            active: true,
            createdAt: '2026-09-06T16:50:59.976Z',
            updatedAt: '2026-09-06T16:50:59.976Z',
        },
    },
    {
        id: 'd424420c-e145-4516-b037-a31b833d5ffc',
        productId: ss260Product.id,
        packageId: '28e9b723-7ae6-429d-856f-89f58eaebba6',
        price: 13.4,
        unit: 'litro',
        active: true,
        createdAt: '2026-09-06T16:51:01.669Z',
        updatedAt: '2026-09-06T16:51:01.669Z',
        packageVolumeLiters: 20,
        package: {
            id: '28e9b723-7ae6-429d-856f-89f58eaebba6',
            name: 'Bombona 20L',
            type: 'BOMBONA_20L',
            capacity: '20L',
            capacityLiters: 20,
            active: true,
            createdAt: '2026-09-06T16:51:00.101Z',
            updatedAt: '2026-09-06T16:51:00.101Z',
        },
    },
];
(0, node_test_1.default)('preserves the real SS-260 price and volume from API through confirmation', () => {
    const offers = (0, quotation_flow_1.parseProductPricesResponse)(ss260ApiResponse);
    strict_1.default.deepEqual(offers.map((offer) => offer.package.type), [
        'IBC_1000L',
        'BOMBONA_20L',
        'SACHÊ',
    ]);
    const sachet = offers.find((offer) => offer.package.type === 'SACHÊ');
    strict_1.default.ok(sachet);
    const quotation = (0, quotation_flow_1.createQuotation)(ss260Product, sachet);
    const quantityStep = (0, quotation_flow_1.submitQuantity)(quotation, '30');
    strict_1.default.equal(quantityStep.ok, true);
    if (!quantityStep.ok)
        return;
    strict_1.default.equal(quantityStep.value.package.volumeLiters, 15);
    strict_1.default.equal(quantityStep.value.package.pricePerLiter, 13);
    strict_1.default.equal(quantityStep.value.quantityLiters, 30);
    strict_1.default.equal(quantityStep.value.boxCount, 2);
    strict_1.default.equal(quantityStep.value.total, 390);
    strict_1.default.equal((0, quotation_flow_1.getPackageDisplayName)(quantityStep.value.package), 'Sachê — Caixa de 15 L');
    strict_1.default.equal((0, quotation_flow_1.formatCurrency)(quantityStep.value.package.pricePerLiter), 'R$ 13,00');
    strict_1.default.equal((0, quotation_flow_1.formatCurrency)(quantityStep.value.total), 'R$ 390,00');
    const confirmation = (0, quotation_flow_1.addPaymentTerm)(quantityStep.value, '1x — 28 dias', '28');
    strict_1.default.equal(confirmation.package.id, 'd6cbd2a9-5173-4049-a54e-ae6139f31abf');
    strict_1.default.equal(confirmation.package.volumeLiters, 15);
    strict_1.default.equal(confirmation.package.pricePerLiter, 13);
    strict_1.default.equal(confirmation.quantityLiters, 30);
    strict_1.default.equal(confirmation.boxCount, 2);
    strict_1.default.equal(confirmation.total, 390);
});
(0, node_test_1.default)('validates full sachet boxes for default, Magnum and Cabum/Pmag volumes', () => {
    const cases = [
        [15, '30', '20'],
        [20, '40', '30'],
        [14, '28', '20'],
    ];
    for (const [volume, valid, invalid] of cases) {
        strict_1.default.equal((0, quotation_flow_1.validateQuantity)(valid, 'SACHÊ', volume).kind, 'valid');
        strict_1.default.equal((0, quotation_flow_1.validateQuantity)(invalid, 'SACHÊ', volume).kind, 'invalid');
    }
});
(0, node_test_1.default)('keeps IBC and Bombona free from full-package multiple validation', () => {
    strict_1.default.equal((0, quotation_flow_1.validateQuantity)('21', 'IBC_1000L', 1000).kind, 'valid');
    strict_1.default.equal((0, quotation_flow_1.validateQuantity)('21', 'BOMBONA_20L', 20).kind, 'valid');
});
(0, node_test_1.default)('does not transform empty, decimal or out-of-range quantity text', () => {
    strict_1.default.equal((0, quotation_flow_1.validateQuantity)('', 'SACHÊ', 15).kind, 'empty');
    strict_1.default.equal((0, quotation_flow_1.validateQuantity)('30,0', 'SACHÊ', 15).kind, 'invalid');
    strict_1.default.equal((0, quotation_flow_1.validateQuantity)('30.0', 'SACHÊ', 15).kind, 'invalid');
    strict_1.default.equal((0, quotation_flow_1.validateQuantity)('1000000', 'SACHÊ', 15).kind, 'invalid');
});
(0, node_test_1.default)('rejects malformed API price and missing structured volume', () => {
    const buildSachetResponse = (price, volume) => [{
            id: '0d1627de-1ce8-4dae-8b32-0ac7e56a7eb1',
            productId: ss260Product.id,
            packageId: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
            price,
            unit: 'litro',
            active: true,
            createdAt: '2026-09-06T16:51:01.566Z',
            updatedAt: '2026-09-06T16:51:01.566Z',
            packageVolumeLiters: volume,
            package: {
                id: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
                name: 'Sachê',
                type: 'SACHÊ',
                capacity: 'Pequena',
                capacityLiters: null,
                active: true,
                createdAt: '2026-09-06T16:50:59.976Z',
                updatedAt: '2026-09-06T16:50:59.976Z',
            },
        }];
    strict_1.default.throws(() => (0, quotation_flow_1.parseProductPricesResponse)(buildSachetResponse('13', 15)), /preço/i);
    strict_1.default.throws(() => (0, quotation_flow_1.parseProductPricesResponse)(buildSachetResponse(13, undefined)), /volume/i);
});
