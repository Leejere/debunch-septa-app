function reverseDict(dict) {
  const reversedDict = {};
  for (const key in dict) {
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      reversedDict[dict[key]] = key;
    }
  }
  return reversedDict;
}

function reverseSubDicts(obj) {
  const result = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const subDict = obj[key];
      const reversedSubDict = reverseDict(subDict);
      result[key] = reversedSubDict;
    }
  }

  return result;
}

export { reverseDict, reverseSubDicts };
