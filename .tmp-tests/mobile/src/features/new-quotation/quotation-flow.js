"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProductPricesResponse = parseProductPricesResponse;
exports.createQuotation = createQuotation;
exports.validateQuantity = validateQuantity;
exports.submitQuantity = submitQuantity;
exports.addPaymentTerm = addPaymentTerm;
exports.getPackageDisplayName = getPackageDisplayName;
exports.formatCurrency = formatCurrency;
const MAX_QUANTITY_LITERS = 999999;
const packageOrder = {
    IBC_1000L: 0,
    BOMBONA_20L: 1,
    SACHÊ: 2,
};
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readString(record, field) {
    const value = record[field];
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Resposta inválida da API: campo ${field} ausente.`);
    }
    return value;
}
function readPackageType(value) {
    if (value === 'IBC_1000L' || value === 'BOMBONA_20L' || value === 'SACHÊ') {
        return value;
    }
    throw new Error('Resposta inválida da API: tipo de embalagem desconhecido.');
}
function parseOffer(value) {
    if (!isRecord(value) || !isRecord(value.package)) {
        throw new Error('Resposta inválida da API: embalagem ausente.');
    }
    const price = value.price;
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
        throw new Error('Resposta inválida da API: preço por litro deve ser numérico e positivo.');
    }
    const volume = value.packageVolumeLiters;
    if (typeof volume !== 'number' || !Number.isInteger(volume) || volume <= 0) {
        throw new Error('Resposta inválida da API: volume estruturado da embalagem ausente.');
    }
    if (typeof value.active !== 'boolean') {
        throw new Error('Resposta inválida da API: situação do preço ausente.');
    }
    const unit = readString(value, 'unit');
    if (unit !== 'litro') {
        throw new Error('Resposta inválida da API: unidade de preço não suportada.');
    }
    const packageRecord = value.package;
    return {
        active: value.active,
        package: {
            id: readString(packageRecord, 'id'),
            name: readString(packageRecord, 'name').trim(),
            type: readPackageType(packageRecord.type),
            volumeLiters: volume,
            pricePerLiter: price,
            unit,
        },
    };
}
function parseProductPricesResponse(value) {
    if (!Array.isArray(value)) {
        throw new Error('Resposta inválida da API: lista de embalagens ausente.');
    }
    return value
        .map(parseOffer)
        .filter((offer) => offer.active)
        .sort((left, right) => packageOrder[left.package.type] - packageOrder[right.package.type]);
}
function createQuotation(product, offer) {
    return {
        product: { ...product },
        package: { ...offer.package },
    };
}
function validateQuantity(text, packageType, volumeLiters) {
    if (text === '')
        return { kind: 'empty' };
    if (!/^\d+$/.test(text)) {
        return { kind: 'invalid', message: 'Informe uma quantidade inteira em litros.' };
    }
    const quantityLiters = Number(text);
    if (!Number.isSafeInteger(quantityLiters) || quantityLiters <= 0) {
        return { kind: 'invalid', message: 'A quantidade deve ser um inteiro positivo.' };
    }
    if (quantityLiters > MAX_QUANTITY_LITERS) {
        return { kind: 'invalid', message: 'A quantidade máxima é 999999 L.' };
    }
    if (packageType !== 'SACHÊ') {
        return { kind: 'valid', quantityLiters, boxCount: null };
    }
    if (!Number.isInteger(volumeLiters) || volumeLiters <= 0) {
        return {
            kind: 'invalid',
            message: 'A configuração do volume da caixa não está disponível. Tente novamente.',
        };
    }
    if (quantityLiters % volumeLiters !== 0) {
        return {
            kind: 'invalid',
            message: `Este produto é vendido em caixas de ${volumeLiters} L. Informe um múltiplo de ${volumeLiters} L.`,
        };
    }
    return { kind: 'valid', quantityLiters, boxCount: quantityLiters / volumeLiters };
}
function submitQuantity(quotation, text) {
    const validation = validateQuantity(text, quotation.package.type, quotation.package.volumeLiters);
    if (validation.kind === 'empty') {
        return { ok: false, message: 'Informe a quantidade em litros.' };
    }
    if (validation.kind === 'invalid') {
        return { ok: false, message: validation.message };
    }
    return {
        ok: true,
        value: {
            ...quotation,
            quantityLiters: validation.quantityLiters,
            boxCount: validation.boxCount,
            total: Number((validation.quantityLiters * quotation.package.pricePerLiter).toFixed(2)),
        },
    };
}
function addPaymentTerm(quotation, paymentTerm, paymentTermProgressValue) {
    return {
        ...quotation,
        paymentTerm,
        paymentTermProgressValue,
    };
}
function getPackageDisplayName(package_) {
    return package_.type === 'SACHÊ'
        ? `${package_.name} — Caixa de ${package_.volumeLiters} L`
        : package_.name;
}
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
