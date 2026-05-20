const assert = require('assert');
const { describe, it } = require('node:test');
const {
  parseBoolean,
  validateTier4CategoryPayload,
  validateParentCategoryTier,
  validateTier4ProductPayload
} = require('../utils/catalogValidation');

describe('Catalog validation utilities', () => {
  it('parses boolean-like values correctly', () => {
    assert.strictEqual(parseBoolean(true), true);
    assert.strictEqual(parseBoolean(false), false);
    assert.strictEqual(parseBoolean('true'), true);
    assert.strictEqual(parseBoolean('false'), false);
    assert.strictEqual(parseBoolean('FALSE'), false);
    assert.strictEqual(parseBoolean('0'), false);
    assert.strictEqual(parseBoolean(1), true);
  });

  it('rejects tier 4 category payload when set as non-sub-tier', () => {
    const error = validateTier4CategoryPayload({ tierLevel: 4, isSubTier: false });
    assert.strictEqual(error, 'Tier 4 must be a sub-tier; to add a product directly under Tier 3, leave "Is Sub-Tier" unchecked and create a product instead.');
  });

  it('accepts tier 4 category payload when isSubTier is true', () => {
    const error = validateTier4CategoryPayload({ tierLevel: 4, isSubTier: true });
    assert.strictEqual(error, null);
  });

  it('validates parent tier requirement for category creation', () => {
    const missingError = validateParentCategoryTier({ tierLevel: 4, parentTierLevel: 2 });
    assert.strictEqual(missingError, 'Parent category must belong to Tier 3.');

    const validError = validateParentCategoryTier({ tierLevel: 4, parentTierLevel: 3 });
    assert.strictEqual(validError, null);
  });

  it('validates direct product payload for Tier 4 form mode', () => {
    const invalid = validateTier4ProductPayload({ categoryTierLevel: 2, isSubTier: false });
    assert.strictEqual(invalid, 'Direct products created from the Tier 4 form must be linked to a Tier 3 category.');

    const valid = validateTier4ProductPayload({ categoryTierLevel: 3, isSubTier: false });
    assert.strictEqual(valid, null);
  });
});
