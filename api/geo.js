// ============================================================
//  /api/geo — restituisce country/region dell'IP del visitatore.
//  Vercel inietta automaticamente gli header geo (gratis).
//  Usato dal valutatore per arricchire il log senza tracciare IP.
// ============================================================

module.exports = function handler(req, res) {
    const country = req.headers['x-vercel-ip-country']        || null;
    const region  = req.headers['x-vercel-ip-country-region'] || null;

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify({ country, region }));
};
