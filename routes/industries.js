const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

const router = new express.Router();

/** GET /industries
 *
 * Returns:
 * {
 *   industries: [
 *     { code, industry, companies: [comp_code, ...] },
 *     ...
 *   ]
 * }
 */

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT i.code,
              i.industry,
              ci.comp_code
       FROM industries AS i
       LEFT JOIN company_industries AS ci
         ON i.code = ci.ind_code
       ORDER BY i.code`
    );

    const industriesMap = {};

    for (let row of result.rows) {
      if (!industriesMap[row.code]) {
        industriesMap[row.code] = {
          code: row.code,
          industry: row.industry,
          companies: []
        };
      }

      if (row.comp_code) {
        industriesMap[row.code].companies.push(row.comp_code);
      }
    }

    return res.json({ industries: Object.values(industriesMap) });
  } catch (err) {
    return next(err);
  }
});

/** POST /industries
 *
 * Expects:
 * {code, industry}
 *
 * Returns:
 * {industry: {code, industry}}
 */

router.post("/", async function (req, res, next) {
  try {
    const { code, industry } = req.body;

    const result = await db.query(
      `INSERT INTO industries (code, industry)
       VALUES ($1, $2)
       RETURNING code, industry`,
      [code, industry]
    );

    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** POST /industries/:code/add
 *
 * Expects:
 * {comp_code}
 *
 * Returns:
 * {association: {comp_code, ind_code}}
 */

router.post("/:code/add", async function (req, res, next) {
  try {
    const indCode = req.params.code;
    const { comp_code } = req.body;

    const industryCheck = await db.query(
      `SELECT code FROM industries WHERE code = $1`,
      [indCode]
    );

    if (!industryCheck.rows[0]) {
      throw new ExpressError("Industry not found", 404);
    }

    const companyCheck = await db.query(
      `SELECT code FROM companies WHERE code = $1`,
      [comp_code]
    );

    if (!companyCheck.rows[0]) {
      throw new ExpressError("Company not found", 404);
    }

    const result = await db.query(
      `INSERT INTO company_industries (comp_code, ind_code)
       VALUES ($1, $2)
       RETURNING comp_code, ind_code`,
      [comp_code, indCode]
    );

    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;