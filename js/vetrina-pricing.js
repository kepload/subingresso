// Shared by the browser, Supabase checkout and the payment tests. Amounts in cents.
(function (root) {
    'use strict';
    const plans = Object.freeze({
        '10d': Object.freeze({ days: 10, cents: 4900, label: 'Vetrina Premium · 10 giorni' }),
        '30d': Object.freeze({ days: 30, cents: 9900, label: 'Vetrina Premium · 30 giorni' }),
        '90d': Object.freeze({ days: 90, cents: 24900, label: 'Vetrina Premium · 90 giorni' })
    });
    function quote(tier, count = 1) {
        if (!Object.hasOwn(plans, tier) || !Number.isInteger(count) || count < 1 || count > 10) throw new Error('Seleziona da 1 a 10 annunci e una durata valida.');
        const discount = count >= 5 ? 20 : count >= 3 ? 15 : count === 2 ? 10 : 0;
        const unit = Math.round(plans[tier].cents * (100 - discount) / 100);
        return Object.freeze({ tier, days: plans[tier].days, count, discount, unit, total: unit * count,
            listTotal: plans[tier].cents * count, savings: (plans[tier].cents - unit) * count });
    }
    const publicationOffer = Object.freeze({ id: 'publication_90d_v1', tier: '90d', discount: 10, minutes: 10 });
    function quotePublication(tier) {
        const standard = quote(tier, 1);
        if (tier !== publicationOffer.tier) return standard;
        const unit = Math.round(standard.listTotal * (100 - publicationOffer.discount) / 100);
        return Object.freeze({ ...standard, discount: publicationOffer.discount, unit, total: unit, savings: standard.listTotal - unit });
    }
    const api = Object.freeze({ plans, quote, quotePublication, publicationOffer, maxListings: 10, version: 'premium-20261027' });
    root.VetrinaPricing = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
