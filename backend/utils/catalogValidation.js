const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() !== 'false';
  }
  if (value === undefined || value === null) return true;
  return Boolean(value);
};

const validateTier4CategoryPayload = ({ tierLevel, isSubTier }) => {
  if (parseInt(tierLevel, 10) === 4 && !parseBoolean(isSubTier)) {
    return 'Tier 4 must be a sub-tier; to add a product directly under Tier 3, leave "Is Sub-Tier" unchecked and create a product instead.';
  }
  return null;
};

const validateParentCategoryTier = ({ tierLevel, parentTierLevel }) => {
  const tierNum = parseInt(tierLevel, 10);
  if (tierNum <= 1) return null;

  const expected = tierNum - 1;
  if (parseInt(parentTierLevel, 10) !== expected) {
    return `Parent category must belong to Tier ${expected}.`;
  }

  return null;
};

const validateTier4ProductPayload = ({ categoryTierLevel, isSubTier }) => {
  if (!parseBoolean(isSubTier)) {
    if (parseInt(categoryTierLevel, 10) !== 3) {
      return 'Direct products created from the Tier 4 form must be linked to a Tier 3 category.';
    }
  }
  return null;
};

module.exports = {
  parseBoolean,
  validateTier4CategoryPayload,
  validateParentCategoryTier,
  validateTier4ProductPayload
};
